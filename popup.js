document.getElementById("runScript").addEventListener("click", async () => {
    // This function will be injected into the page.
    async function automationCode() {
      // ---------------------------
      // CONFIG
      // ---------------------------
      // The element that opens (and closes) the CTA dropdown
      const CTA_DROPDOWN_TRIGGER_SELECTOR = '[data-testid="select-tree-container-inside-kF6CnX"]';
  
      // The container holding all CTA options (where "Select all" is located)
      const CTA_OPTIONS_CONTAINER_SELECTOR = '[data-testid="select-tree-index-4hUVUU"]';
  
      // The "Select all" checkbox label
      const SELECT_ALL_LABEL_SELECTOR = 'label[data-testid="select-tree-index-mXdooW"]';
  
      // The CTAs we want to select
      const CTA_TEXTS_TO_SELECT = ["Install now", "Download"];
  
      // ---------------------------
      // UTILS
      // ---------------------------
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
  
      async function waitForElement(selector, timeoutMs = 5000) {
        const pollInterval = 100;
        let elapsed = 0;
        while (elapsed < timeoutMs) {
          const el = document.querySelector(selector);
          if (el) return el;
          await sleep(pollInterval);
          elapsed += pollInterval;
        }
        throw new Error(`Could not find element: ${selector} within ${timeoutMs}ms`);
      }
  
      function click(el) {
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        el.click();
      }
  
      // Clicks the "Select all" label twice:
      // 1st click selects all, 2nd click unselects all.
      async function toggleSelectAllTwice() {
        const selectAllLabel = await waitForElement(SELECT_ALL_LABEL_SELECTOR, 5000);
        // First click -> selects all
        click(selectAllLabel);
        await sleep(500);
        // Second click -> unselects all
        click(selectAllLabel);
        await sleep(500);
        console.log('All preselected CTAs removed via "Select all" toggle.');
      }
  
      // Select a CTA by its visible text in the container
      function selectCTAByText(text, container) {
        const nodes = [...container.querySelectorAll('.vi-tree-node__content')];
        for (const node of nodes) {
          const textDiv = node.querySelector('.index_nodeContent_woTlE div');
          if (textDiv && textDiv.textContent.trim() === text.trim()) {
            const checkboxLabel = node.querySelector('label.vi-checkbox');
            if (checkboxLabel) {
              click(checkboxLabel);
              console.log(`Selected CTA: "${text}"`);
            } else {
              console.warn(`Could not find checkbox for "${text}"`);
            }
            return;
          }
        }
        console.warn(`CTA option "${text}" not found in container!`);
      }
  
      // ---------------------------
      // MAIN
      // ---------------------------
      try {
        console.log("Starting CTA removal + selection (via Select All)...");
  
        // 1) Open the dropdown
        const dropdownTrigger = await waitForElement(CTA_DROPDOWN_TRIGGER_SELECTOR, 8000);
        click(dropdownTrigger);
        console.log("Dropdown opened.");
        await sleep(300);
  
        // 2) Wait for the container that holds the CTA options
        const ctaContainer = await waitForElement(CTA_OPTIONS_CONTAINER_SELECTOR, 5000);
  
        // 3) Toggle "Select All" twice to remove any preselected CTAs
        await toggleSelectAllTwice();
  
        // 4) Select the desired CTAs
        for (const text of CTA_TEXTS_TO_SELECT) {
          selectCTAByText(text, ctaContainer);
          await sleep(300);
        }
  
        // 5) Close the dropdown by re-clicking the trigger
        await sleep(500);
        click(dropdownTrigger);
        console.log("Dropdown closed.");
  
        console.log("Done removing old CTAs and selecting new CTAs.");
      } catch (err) {
        console.error("Error while adjusting CTAs:", err);
      }
    }
  
    // Inject our automationCode function into the current active tab
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: automationCode
        });
        console.log("Automation script injected.");
      }
    } catch (error) {
      console.error("Script injection failed:", error);
    }
  });