import "@logseq/libs";
import { createPopper } from "@popperjs/core";
import "emoji-picker-element";
import "./style.css";

async function main() {
  const appUserConfig = await logseq.App.getUserConfigs();
  const $app = document.getElementById("app")!;
  const $emojiPicker = document.createElement("emoji-picker");
  $emojiPicker.classList.add(appUserConfig.preferredThemeMode);
  const $customStyle = document.createElement("style");
  $customStyle.textContent = `
  .pad-top.pad-top {
    display: none;
  }
  .search-row.search-row {
    padding: 0;
    border-bottom: var(--border-size) solid var(--border-color);
  }
  .search.search {
    border: none;
  }
  `;
  $emojiPicker.shadowRoot?.appendChild($customStyle);
  $app.appendChild($emojiPicker);

  const popper = createPopper($app, $emojiPicker, {
    placement: "right-start",
    modifiers: [
      {
        name: "eventListeners",
        enabled: false
      },
    ]
  });

  async function show() {
    await updatePosition();
    const $search = $emojiPicker.shadowRoot!.querySelector("#search")! as HTMLInputElement;
    $search.value = "";
    logseq.showMainUI();
    setTimeout(() => {
      $search.focus();
    }, 100);
  }
  function hide(opts?: {
    restoreEditingCursor: boolean;
  } | undefined) {
    logseq.hideMainUI(opts);
  }

  $emojiPicker.addEventListener("emoji-click", async (event) => {
    if (event.detail.unicode == null) {
      console.error(event.detail);
      return;
    }
    await logseq.Editor.insertAtEditingCursor(event.detail.unicode);
    hide();
  });

  document.addEventListener("click", (event) => {
    if (!(event.target as HTMLElement).closest("emoji-picker")) {
      hide({ restoreEditingCursor: true });
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hide({ restoreEditingCursor: true });
    }
  });
  logseq.App.onThemeModeChanged(({ mode }) => {
    $emojiPicker.classList.add(mode);
  });
  window.addEventListener("resize", () => {
    updatePosition();
  })
  logseq.Editor.registerSlashCommand(
    "Emoji picker",
    async () => {
      await show();
    }
  );
  const updatePosition = async () => {
    const position = await logseq.Editor.getEditingCursorPosition();
    if (position == null) {
      throw new Error("Cannot get cursor position");
    }
    const { left, top, rect } = position;
    $app.style.top = `calc(${top + rect.top + 6}px - 1rem)`;
    $app.style.left = `${left + rect.left}px`;
    popper.update();
  }
}

logseq.ready(main).catch(console.error);