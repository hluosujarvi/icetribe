// Silktide Consent Manager - https://silktide.com/consent-manager/  

class SilktideCookieBanner {
  constructor(config) {
    this.config = config; // Save config to the instance

    this.wrapper = null;
    this.banner = null;
    this.modal = null;
    this.cookieIcon = null;
    this.backdrop = null;

    this.createWrapper();

    if (this.shouldShowBackdrop()) {
      this.createBackdrop();
    }

    this.createCookieIcon();
    this.createModal();

    if (this.shouldShowBanner()) {
      this.createBanner();
      this.showBackdrop();
    } else {
      this.showCookieIcon();
    }

    this.setupEventListeners();

    if (this.hasSetInitialCookieChoices()) {
      this.loadRequiredCookies();
      this.runAcceptedCookieCallbacks();
    }
  }

  destroyCookieBanner() {
    // Remove all cookie banner elements from the DOM
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }

    // Restore scrolling
    this.allowBodyScroll();

    // Clear all references
    this.wrapper = null;
    this.banner = null;
    this.modal = null;
    this.cookieIcon = null;
    this.backdrop = null;
  }

  // ----------------------------------------------------------------
  // Wrapper
  // ----------------------------------------------------------------
  createWrapper() {
    this.wrapper = document.createElement('div');
    this.wrapper.id = 'silktide-wrapper';
    document.body.insertBefore(this.wrapper, document.body.firstChild);
  }

  // ----------------------------------------------------------------
  // Wrapper Child Generator
  // ----------------------------------------------------------------
  createWrapperChild(htmlContent, id) {
    // Create child element
    const child = document.createElement('div');
    child.id = id;
    child.innerHTML = htmlContent;

    // Ensure wrapper exists
    if (!this.wrapper || !document.body.contains(this.wrapper)) {
      this.createWrapper();
    }

    // Append child to wrapper
    this.wrapper.appendChild(child);
    return child;
  }

  // ----------------------------------------------------------------
  // Backdrop
  // ----------------------------------------------------------------
  createBackdrop() {
    this.backdrop = this.createWrapperChild(null, 'silktide-backdrop');
  }

  showBackdrop() {
    if (this.backdrop) {
      this.backdrop.style.display = 'block';
    }
    // Trigger optional onBackdropOpen callback
    if (typeof this.config.onBackdropOpen === 'function') {
      this.config.onBackdropOpen();
    }
  }

  hideBackdrop() {
    if (this.backdrop) {
      this.backdrop.style.display = 'none';
    }

    // Trigger optional onBackdropClose callback
    if (typeof this.config.onBackdropClose === 'function') {
      this.config.onBackdropClose();
    }
  }

  shouldShowBackdrop() {
    return this.config?.background?.showBackground || false;
  }

  // update the checkboxes in the modal with the values from localStorage
  updateCheckboxState(saveToStorage = false) {
    const preferencesSection = this.modal.querySelector('#cookie-preferences');
    const checkboxes = preferencesSection.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach((checkbox) => {
      const [, cookieId] = checkbox.id.split('cookies-');
      const cookieType = this.config.cookieTypes.find(type => type.id === cookieId);
      
      if (!cookieType) return;

      if (saveToStorage) {
        // Save the current state to localStorage and run callbacks
        const currentState = checkbox.checked;
        
        if (cookieType.required) {
          localStorage.setItem(
            `silktideCookieChoice_${cookieId}${this.getBannerSuffix()}`,
            'true'
          );
        } else {
          localStorage.setItem(
            `silktideCookieChoice_${cookieId}${this.getBannerSuffix()}`,
            currentState.toString()
          );
          
          // Run appropriate callback
          if (currentState && typeof cookieType.onAccept === 'function') {
            cookieType.onAccept();
          } else if (!currentState && typeof cookieType.onReject === 'function') {
            cookieType.onReject();
          }
        }
      } else {
        // When reading values (opening modal)
        if (cookieType.required) {
          checkbox.checked = true;
          checkbox.disabled = true;
        } else {
          const storedValue = localStorage.getItem(
            `silktideCookieChoice_${cookieId}${this.getBannerSuffix()}`
          );
          
          if (storedValue !== null) {
            checkbox.checked = storedValue === 'true';
          } else {
            checkbox.checked = !!cookieType.defaultValue;
          }
        }
      }
    });
  }

  setInitialCookieChoiceMade() {
    window.localStorage.setItem(`silktideCookieBanner_InitialChoice${this.getBannerSuffix()}`, 1);
  }

  // ----------------------------------------------------------------
  // Consent Handling
  // ----------------------------------------------------------------
  handleCookieChoice(accepted) {
    // We set that an initial choice was made regardless of what it was so we don't show the banner again
    this.setInitialCookieChoiceMade();

    this.removeBanner();
    this.hideBackdrop();
    this.toggleModal(false);
    this.showCookieIcon();

    this.config.cookieTypes.forEach((type) => {
      // Set localStorage and run accept/reject callbacks
      if (type.required == true) {
        localStorage.setItem(`silktideCookieChoice_${type.id}${this.getBannerSuffix()}`, 'true');
        if (typeof type.onAccept === 'function') { type.onAccept() }
      } else {
        localStorage.setItem(
          `silktideCookieChoice_${type.id}${this.getBannerSuffix()}`,
          accepted.toString(),
        );

        if (accepted) {
          if (typeof type.onAccept === 'function') { type.onAccept(); }
        } else {
          if (typeof type.onReject === 'function') { type.onReject(); }
        }
      }
    });
  }

  getAcceptedCookies() {
    return (this.config.cookieTypes || []).reduce((acc, cookieType) => {
      acc[cookieType.id] =
        localStorage.getItem(`silktideCookieChoice_${cookieType.id}${this.getBannerSuffix()}`) ===
        'true';
      return acc;
    }, {});
  }

  runAcceptedCookieCallbacks() {
    if (!this.config.cookieTypes) return;

    const acceptedCookies = this.getAcceptedCookies();
    this.config.cookieTypes.forEach((type) => {
      if (type.required) return; // we run required cookies separately in loadRequiredCookies
      if (acceptedCookies[type.id] && typeof type.onAccept === 'function') {
        if (typeof type.onAccept === 'function') { type.onAccept(); }
      }
    });
  }

  runRejectedCookieCallbacks() {
    if (!this.config.cookieTypes) return;

    const acceptedCookies = this.getAcceptedCookies();
    this.config.cookieTypes.forEach((type) => {
      if (type.required) return; // we run required cookies separately in loadRequiredCookies
      if (!acceptedCookies[type.id] && typeof type.onReject === 'function') {
        if (typeof type.onReject === 'function') { type.onReject(); }
      }
    });
  }

  /**
   * Run through all of the cookie callbacks based on the current localStorage values
   */
  runStoredCookiePreferenceCallbacks() {
    this.runAcceptedCookieCallbacks();
    this.runRejectedCookieCallbacks();
  }

  loadRequiredCookies() {
    if (!this.config.cookieTypes) return;
    this.config.cookieTypes.forEach((cookie) => {
      if (cookie.required && typeof cookie.onAccept === 'function') {
        if (typeof cookie.onAccept === 'function') { cookie.onAccept(); }
      }
    });
  }

  // ----------------------------------------------------------------
  // Banner
  // ----------------------------------------------------------------
  getBannerContent() {
    const bannerDescription =
      this.config.text?.banner?.description ||
      "<p>We use cookies on our site to enhance your user experience, provide personalized content, and analyze our traffic.</p>";

    // Accept button
    const acceptAllButtonText = this.config.text?.banner?.acceptAllButtonText || 'Accept all';
    const acceptAllButtonLabel = this.config.text?.banner?.acceptAllButtonAccessibleLabel;
    const acceptAllButton = `<button class="accept-all st-button st-button--primary"${
      acceptAllButtonLabel && acceptAllButtonLabel !== acceptAllButtonText 
        ? ` aria-label="${acceptAllButtonLabel}"` 
        : ''
    }>${acceptAllButtonText}</button>`;
    
    // Reject button
    const rejectNonEssentialButtonText = this.config.text?.banner?.rejectNonEssentialButtonText || 'Reject non-essential';
    const rejectNonEssentialButtonLabel = this.config.text?.banner?.rejectNonEssentialButtonAccessibleLabel;
    const rejectNonEssentialButton = `<button class="reject-all st-button st-button--primary"${
      rejectNonEssentialButtonLabel && rejectNonEssentialButtonLabel !== rejectNonEssentialButtonText 
        ? ` aria-label="${rejectNonEssentialButtonLabel}"` 
        : ''
    }>${rejectNonEssentialButtonText}</button>`;

    // Preferences button
    const preferencesButtonText = this.config.text?.banner?.preferencesButtonText || 'Preferences';
    const preferencesButtonLabel = this.config.text?.banner?.preferencesButtonAccessibleLabel;
    const preferencesButton = `<button class="preferences"${
      preferencesButtonLabel && preferencesButtonLabel !== preferencesButtonText 
        ? ` aria-label="${preferencesButtonLabel}"` 
        : ''
    }><span>${preferencesButtonText}</span></button>`;

    // Silktide logo link
    const silktideLogo = `
      <a class="silktide-logo" href="https://silktide.com/consent-manager" target="_blank" rel="noreferrer" aria-label="Visit the Silktide Consent Manager page">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="inherit">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M14.1096 16.7745C13.8895 17.2055 13.3537 17.3805 12.9129 17.1653L8.28443 14.9055L2.73192 17.7651L11.1025 21.9814C11.909 22.3876 12.8725 22.3591 13.6524 21.9058L20.4345 17.9645C21.2845 17.4704 21.7797 16.5522 21.7164 15.5872L21.7088 15.4704C21.6487 14.5561 21.0962 13.7419 20.2579 13.0983L13.476 7.02195C13.0664 6.66076 12.4805 6.65539 12.0637 7.01013L5.28174 12.7886C4.86491 13.1433 4.21899 13.1379 3.80938 12.7759L2.30664 11.4102C1.89703 11.0482 1.25111 11.0536 0.834282 11.4083L0.834282 11.4083C0.417454 11.7631 0.407083 12.4089 0.812129 12.7759L3.80938 15.4609L7.17383 18.3594C7.57856 18.7206 8.16448 18.7259 8.5813 18.3712L15.3633 12.5927C15.7801 12.238 16.426 12.2426 16.8356 12.6038L21.5977 16.8672C22.4359 17.5108 23 18.325 23.0625 19.2393L23.0703 19.3561C23.1335 20.3211 22.6384 21.2393 21.7881 21.7334L15.0059 25.6748C14.2261 26.128 13.2627 26.1566 12.456 25.7504L4.08545 21.5341L9.63796 18.6745L14.2664 20.9343C14.7072 21.1495 15.243 20.9745 15.4631 20.5435C15.6832 20.1125 15.5033 19.5767 15.0625 19.3615L10.434 17.1017L4.88147 19.9614L13.252 24.1777C13.6406 24.3703 14.0791 24.3562 14.457 24.1404L21.2392 20.199C21.6171 19.9832 21.854 19.6016 21.8164 19.1895L21.8086 19.0727C21.771 18.6606 21.4648 18.3047 21.0469 18.1357L15.0625 15.5615C14.6217 15.3463 14.0859 15.5213 13.8658 15.9523L13.8658 15.9523Z" fill="#533BE2"/>
        </svg>
      </a>
    `;

    const bannerContent = `
      ${bannerDescription}
      <div class="actions">                               
        ${acceptAllButton}
        ${rejectNonEssentialButton}
        <div class="actions-row">
          ${preferencesButton}
          ${silktideLogo}
        </div>
      </div>
    `;

    return bannerContent;
  }

  hasSetInitialCookieChoices() {
    return !!localStorage.getItem(`silktideCookieBanner_InitialChoice${this.getBannerSuffix()}`);
  }

  createBanner() {
    // Create banner element
    this.banner = this.createWrapperChild(this.getBannerContent(), 'silktide-banner');

    // Add positioning class from config
    if (this.banner && this.config.position?.banner) {
      this.banner.classList.add(this.config.position.banner);
    }

    // Trigger optional onBannerOpen callback
    if (this.banner && typeof this.config.onBannerOpen === 'function') {
      this.config.onBannerOpen();
    }
  }

  removeBanner() {
    if (this.banner && this.banner.parentNode) {
      this.banner.parentNode.removeChild(this.banner);
      this.banner = null;

      // Trigger optional onBannerClose callback
      if (typeof this.config.onBannerClose === 'function') {
        this.config.onBannerClose();
      }
    }
  }

  shouldShowBanner() {
    if (this.config.showBanner === false) {
      return false;
    }
    return (
      localStorage.getItem(`silktideCookieBanner_InitialChoice${this.getBannerSuffix()}`) === null
    );
  }

  // ----------------------------------------------------------------
  // Modal
  // ----------------------------------------------------------------
  getModalContent() {
    const preferencesTitle =
      this.config.text?.preferences?.title || 'Customize your cookie preferences';
    
    const preferencesDescription =
      this.config.text?.preferences?.description ||
      "<p>We respect your right to privacy. You can choose not to allow some types of cookies. Your cookie preferences will apply across our website.</p>";
    
    // Preferences button
    const preferencesButtonLabel = this.config.text?.banner?.preferencesButtonAccessibleLabel;

    const closeModalButton = `<button class="modal-close"${preferencesButtonLabel ? ` aria-label="${preferencesButtonLabel}"` : ''}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.4081 3.41559C20.189 2.6347 20.189 1.36655 19.4081 0.585663C18.6272 -0.195221 17.3591 -0.195221 16.5782 0.585663L10 7.17008L3.41559 0.59191C2.6347 -0.188974 1.36655 -0.188974 0.585663 0.59191C-0.195221 1.37279 -0.195221 2.64095 0.585663 3.42183L7.17008 10L0.59191 16.5844C-0.188974 17.3653 -0.188974 18.6335 0.59191 19.4144C1.37279 20.1953 2.64095 20.1953 3.42183 19.4144L10 12.8299L16.5844 19.4081C17.3653 20.189 18.6335 20.189 19.4144 19.4081C20.1953 18.6272 20.1953 17.3591 19.4144 16.5782L12.8299 10L19.4081 3.41559Z" fill="#253B48"/>
      </svg>
    </button>`;
    

    const cookieTypes = this.config.cookieTypes || [];
    const acceptedCookieMap = this.getAcceptedCookies();

    // Accept button
    const acceptAllButtonText = this.config.text?.banner?.acceptAllButtonText || 'Accept all';
    const acceptAllButtonLabel = this.config.text?.banner?.acceptAllButtonAccessibleLabel;
    const acceptAllButton = `<button class="preferences-accept-all st-button st-button--primary"${
      acceptAllButtonLabel && acceptAllButtonLabel !== acceptAllButtonText 
        ? ` aria-label="${acceptAllButtonLabel}"` 
        : ''
    }>${acceptAllButtonText}</button>`;
    
    // Reject button
    const rejectNonEssentialButtonText = this.config.text?.banner?.rejectNonEssentialButtonText || 'Reject non-essential';
    const rejectNonEssentialButtonLabel = this.config.text?.banner?.rejectNonEssentialButtonAccessibleLabel;
    const rejectNonEssentialButton = `<button class="preferences-reject-all st-button st-button--primary"${
      rejectNonEssentialButtonLabel && rejectNonEssentialButtonLabel !== rejectNonEssentialButtonText 
        ? ` aria-label="${rejectNonEssentialButtonLabel}"` 
        : ''
    }>${rejectNonEssentialButtonText}</button>`;
    
    // Credit link
    const creditLinkText = this.config.text?.preferences?.creditLinkText || 'Get this banner for free';
    const creditLinkAccessibleLabel = this.config.text?.preferences?.creditLinkAccessibleLabel;
    const creditLink = `<a href="https://silktide.com/consent-manager" target="_blank" rel="noreferrer"${
      creditLinkAccessibleLabel && creditLinkAccessibleLabel !== creditLinkText
        ? ` aria-label="${creditLinkAccessibleLabel}"`
        : ''
    }>${creditLinkText}</a>`;
    
    

    const modalContent = `
      <header>
        <h1>${preferencesTitle}</h1>                    
        ${closeModalButton}
      </header>
      ${preferencesDescription}
      <section id="cookie-preferences">
        ${cookieTypes
          .map((type) => {
            const accepted = acceptedCookieMap[type.id];
            let isChecked = false;

            // if it's accepted then show as checked
            if (accepted) {
              isChecked = true;
            }

            // if nothing has been accepted / rejected yet, then show as checked if the default value is true
            if (!accepted && !this.hasSetInitialCookieChoices()) {
              isChecked = type.defaultValue;
            }

            return `
            <fieldset>
                <legend>${type.name}</legend>
                <div class="cookie-type-content">
                    <div class="cookie-type-description">${type.description}</div>
                    <label class="switch" for="cookies-${type.id}">
                        <input type="checkbox" id="cookies-${type.id}" ${
              type.required ? 'checked disabled' : isChecked ? 'checked' : ''
            } />
                        <span class="switch__pill" aria-hidden="true"></span>
                        <span class="switch__dot" aria-hidden="true"></span>
                        <span class="switch__off" aria-hidden="true">Off</span>
                        <span class="switch__on" aria-hidden="true">On</span>
                    </label>
                </div>
            </fieldset>
        `;
          })
          .join('')}
      </section>
      <footer>
        ${acceptAllButton}
        ${rejectNonEssentialButton}
        ${creditLink}
      </footer>
    `;

    return modalContent;
  }

  createModal() {
    // Create banner element
    this.modal = this.createWrapperChild(this.getModalContent(), 'silktide-modal');
  }

  toggleModal(show) {
    if (!this.modal) return;

    this.modal.style.display = show ? 'flex' : 'none';

    if (show) {
      this.showBackdrop();
      this.hideCookieIcon();
      this.removeBanner();
      this.preventBodyScroll();

      // Focus the close button
      const modalCloseButton = this.modal.querySelector('.modal-close');
      modalCloseButton.focus();

      // Trigger optional onPreferencesOpen callback
      if (typeof this.config.onPreferencesOpen === 'function') {
        this.config.onPreferencesOpen();
      }

      this.updateCheckboxState(false); // read from storage when opening
    } else {
      // Set that an initial choice was made when closing the modal
      this.setInitialCookieChoiceMade();
      
      // Save current checkbox states to storage
      this.updateCheckboxState(true);

      this.hideBackdrop();
      this.showCookieIcon();
      this.allowBodyScroll();

      // Trigger optional onPreferencesClose callback
      if (typeof this.config.onPreferencesClose === 'function') {
        this.config.onPreferencesClose();
      }
    }
  }

  // ----------------------------------------------------------------
  // Cookie Icon
  // ----------------------------------------------------------------
  getCookieIconContent() {
    return `
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.1172 1.15625C19.0547 0.734374 18.7344 0.390624 18.3125 0.328124C16.5859 0.0859365 14.8281 0.398437 13.2813 1.21875L7.5 4.30469C5.96094 5.125 4.71875 6.41406 3.95313 7.98437L1.08594 13.8906C0.320314 15.4609 0.0703136 17.2422 0.375001 18.9609L1.50781 25.4297C1.8125 27.1562 2.64844 28.7344 3.89063 29.9766C5.13281 31.2187 6.71094 32.0547 8.4375 32.3594L14.9063 33.4922C16.625 33.7969 18.4063 33.5469 19.9766 32.7812L25.8828 29.9141C27.4531 29.1484 28.7422 27.9062 29.5625 26.3672L32.6484 20.5859C33.4687 19.0469 33.7812 17.2891 33.5391 15.5625C33.4766 15.1406 33.1328 14.8203 32.7109 14.7578C32.2891 14.6953 31.9687 15.0391 31.9063 15.4609C31.7031 16.9297 31.4375 18.4297 30.8828 19.7812L27.7969 25.5625C27.1172 26.8437 26.0547 27.8906 24.7734 28.4453L18.8672 31.3125C17.7344 31.7969 16.4844 32 15.2422 31.7734L8.77344 30.6406C7.53125 30.4141 6.375 29.75 5.46094 28.8359C4.54688 27.9219 3.88281 26.7656 3.65625 25.5234L2.52344 19.0547C2.29688 17.8125 2.5 16.5625 2.98437 15.4297L5.85156 9.52344C6.40625 8.24219 7.45313 7.17969 8.73437 6.5L14.5156 3.63281C15.8672 3.07813 17.3672 2.8125 18.8359 3.01563C19.2578 3.07813 19.5781 2.75781 19.6406 2.33594C19.7031 1.91406 19.3828 1.59375 18.9609 1.53125C18.6641 1.48438 18.3906 1.30469 18.3906 1.30469C18.3906 1.30469 18.8906 1.42188 19.1172 1.15625Z" fill="white"/>
      </svg>
    `;
  }

  createCookieIcon() {
    this.cookieIcon = document.createElement('button');
    this.cookieIcon.id = 'silktide-cookie-icon';
    this.cookieIcon.title = 'Manage your cookie preferences for this site';
    this.cookieIcon.innerHTML = this.getCookieIconContent();

    if (this.config.text?.banner?.preferencesButtonAccessibleLabel) {
      this.cookieIcon.ariaLabel = this.config.text?.banner?.preferencesButtonAccessibleLabel;
    }

    // Ensure wrapper exists
    if (!this.wrapper || !document.body.contains(this.wrapper)) {
      this.createWrapper();
    }

    // Append child to wrapper
    this.wrapper.appendChild(this.cookieIcon);

    // Add positioning class from config
    if (this.cookieIcon && this.config.cookieIcon?.position) {
      this.cookieIcon.classList.add(this.config.cookieIcon.position);
    }

    // Add color scheme class from config
    if (this.cookieIcon && this.config.cookieIcon?.colorScheme) {
      this.cookieIcon.classList.add(this.config.cookieIcon.colorScheme);
    }
  }

  showCookieIcon() {
    if (this.cookieIcon) {
      this.cookieIcon.style.display = 'flex';
    }
  }

  hideCookieIcon() {
    if (this.cookieIcon) {
      this.cookieIcon.style.display = 'none';
    }
  }

  /**
   * This runs if the user closes the modal without making a choice for the first time
   * We apply the default values and the necessary values as default
   */
  handleClosedWithNoChoice() {
    this.config.cookieTypes.forEach((type) => {
      let accepted = true;
      // Set localStorage and run accept/reject callbacks
      if (type.required == true || type.defaultValue) {
        localStorage.setItem(
          `silktideCookieChoice_${type.id}${this.getBannerSuffix()}`,
          accepted.toString(),
        );
      } else {
        accepted = false;
        localStorage.setItem(
          `silktideCookieChoice_${type.id}${this.getBannerSuffix()}`,
          accepted.toString(),
        );
      }

      if (accepted) {
        if (typeof type.onAccept === 'function') { type.onAccept(); }
      } else {
        if (typeof type.onReject === 'function') { type.onReject(); }
      }
      // set the flag to say that the cookie choice has been made
      this.setInitialCookieChoiceMade();
      this.updateCheckboxState();
    });
  }

  // ----------------------------------------------------------------
  // Focusable Elements
  // ----------------------------------------------------------------
  getFocusableElements(element) {
    return element.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
  }

  // ----------------------------------------------------------------
  // Event Listeners
  // ----------------------------------------------------------------
  setupEventListeners() {
    // Check Banner exists before trying to add event listeners
    if (this.banner) {
      // Get the buttons
      const acceptButton = this.banner.querySelector('.accept-all');
      const rejectButton = this.banner.querySelector('.reject-all');
      const preferencesButton = this.banner.querySelector('.preferences');

      // Add event listeners to the buttons
      acceptButton?.addEventListener('click', () => this.handleCookieChoice(true));
      rejectButton?.addEventListener('click', () => this.handleCookieChoice(false));
      preferencesButton?.addEventListener('click', () => {
        this.showBackdrop();
        this.toggleModal(true);
      });

      // Focus Trap
      const focusableElements = this.getFocusableElements(this.banner);
      const firstFocusableEl = focusableElements[0];
      const lastFocusableEl = focusableElements[focusableElements.length - 1];

      // Add keydown event listener to handle tab navigation
      this.banner.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusableEl) {
              lastFocusableEl.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusableEl) {
              firstFocusableEl.focus();
              e.preventDefault();
            }
          }
        }
      });

      // Set initial focus
      if (this.config.mode !== 'wizard') {
        acceptButton?.focus();
      }
    }

    // Check Modal exists before trying to add event listeners
    if (this.modal) {
      const closeButton = this.modal.querySelector('.modal-close');
      const acceptAllButton = this.modal.querySelector('.preferences-accept-all');
      const rejectAllButton = this.modal.querySelector('.preferences-reject-all');

      closeButton?.addEventListener('click', () => {
        this.toggleModal(false);
      });

      acceptAllButton?.addEventListener('click', () => {
        this.handleCookieChoice(true);
      });

      rejectAllButton?.addEventListener('click', () => {
        this.handleCookieChoice(false);
      });

      // Handle checkbox changes in modal
      const checkboxes = this.modal.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
          const [, cookieId] = checkbox.id.split('cookies-');
          const cookieType = this.config.cookieTypes.find(type => type.id === cookieId);
          
          if (cookieType && !cookieType.required) {
            // Run appropriate callback immediately when checkbox changes
            if (checkbox.checked && typeof cookieType.onAccept === 'function') {
              cookieType.onAccept();
            } else if (!checkbox.checked && typeof cookieType.onReject === 'function') {
              cookieType.onReject();
            }
          }
        });
      });
    }

    // Check Cookie Icon exists before trying to add event listeners
    if (this.cookieIcon) {

      this.cookieIcon.addEventListener('click', () => {
        // If modal is not found, create it
        if (!this.modal) {
          this.createModal();
          this.toggleModal(true);
          this.hideCookieIcon();
        }
        // If modal is hidden, show it
        else if (this.modal.style.display === 'none' || this.modal.style.display === '') {
          this.toggleModal(true);
          this.hideCookieIcon();
        }
        // If modal is visible, hide it
        else {
          this.toggleModal(false);
        }
      });
    }
  }

  getBannerSuffix() {
    if (this.config.bannerSuffix) {
      return '_' + this.config.bannerSuffix;
    }
    return '';
  }

  preventBodyScroll() {
    document.body.style.overflow = 'hidden';
    // Prevent iOS Safari scrolling
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }

  allowBodyScroll() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }
}

(function () {
  window.silktideCookieBannerManager = {};

  let config = {};
  let cookieBanner;

  function updateCookieBannerConfig(userConfig = {}) {
    config = {...config, ...userConfig};

    // If cookie banner exists, destroy and recreate it with new config
    if (cookieBanner) {
      cookieBanner.destroyCookieBanner(); // We'll need to add this method
      cookieBanner = null;
    }

    // Only initialize if document.body exists
    if (document.body) {
      initCookieBanner();
    } else {
      // Wait for DOM to be ready
      document.addEventListener('DOMContentLoaded', initCookieBanner, {once: true});
    }
  }

  function initCookieBanner() {
    if (!cookieBanner) {
      cookieBanner = new SilktideCookieBanner(config); // Pass config to the CookieBanner instance
    }
  }

  function injectScript(url, loadOption) {
    // Check if script with this URL already exists
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      return; // Script already exists, don't add it again
    }

    const script = document.createElement('script');
    script.src = url;

    // Apply the async or defer attribute based on the loadOption parameter
    if (loadOption === 'async') {
      script.async = true;
    } else if (loadOption === 'defer') {
      script.defer = true;
    }

    document.head.appendChild(script);
  }

  window.silktideCookieBannerManager.initCookieBanner = initCookieBanner;
  window.silktideCookieBannerManager.updateCookieBannerConfig = updateCookieBannerConfig;
  window.silktideCookieBannerManager.injectScript = injectScript;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner, {once: true});
  } else {
    initCookieBanner();
  }
})()