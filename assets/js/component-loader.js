/* Loads the page shell and its section components from the components folder. */
(async function loadPageComponents() {
  try {
    let placeholders = document.querySelectorAll("[data-component]");

    while (placeholders.length) {
      await Promise.all(
        Array.from(placeholders).map(async (placeholder) => {
          const componentPath = placeholder.dataset.component;
          const response = await fetch(componentPath);

          if (!response.ok) {
            throw new Error(`Could not load ${componentPath} (${response.status}).`);
          }

          placeholder.insertAdjacentHTML("beforebegin", await response.text());
          placeholder.remove();
        }),
      );

      placeholders = document.querySelectorAll("[data-component]");
    }
  } catch (error) {
    console.error("Portfolio components did not load:", error);
    document.querySelectorAll("[data-component]").forEach((placeholder) => {
      placeholder.textContent = "This page section could not be loaded. Please refresh the page.";
    });
  } finally {
    document.documentElement.dataset.componentsReady = "true";
    document.dispatchEvent(new CustomEvent("site:components-ready"));
  }
})();
