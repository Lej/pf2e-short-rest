Hooks.on("init", onInit);
Hooks.on("ready", onReady);
Hooks.on("renderSceneControls", onRenderSceneControls);

function log(...args) {
  console.log("pf2e-short-rest", "|", ...args);
}

function onInit() {
  log("This code runs once the Foundry VTT software begins its initialization workflow.");
}

async function onReady() {
  log("This code runs once core initialization is ready and game data is available.");
  await createJournalEntry();
  log(getJournalEntry());
}

function onRenderSceneControls(controls, html, x) {
  log(controls, html, x);
  if (controls.activeControl === "token") {
    const tools = document.getElementById("tools-panel-token");
    const button = fromHtml(`
    <li id="pf2e-short-rest-button" class="control-tool " aria-label="Short Rest" role="button" data-tooltip="Short Rest">
      <i class="fas fa-campfire"></i>
    </li>
    `);
    log(button);
    button.addEventListener("click", (...args) => {
      log("clicked", ...args);
      new Pf2eShortRestApplication().render(true);
    });
    tools.appendChild(button);
  }
}

function fromHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const result = template.content.children;
  if (result.length === 1) return result[0];
  return result;
}

function getJournalEntry() {
  return game.journal.getName(Pf2eShortRest.journalEntryName);
}

async function createJournalEntry() {
  const journalEntry = getJournalEntry();
  if (!journalEntry && game.user.isGM) {
    const newJournalEntry = await JournalEntry.create({
      name: Pf2eShortRest.journalEntryName,
      ownership: {
        default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
      },
    });
    const page1 = await JournalEntryPage.create({
      name: "Description",
      type: "text",
      text: {
        content: "Hello World!"
      }
    }, {
      parent: newJournalEntry
    });
    const page2 = await JournalEntryPage.create({
      name: "Data",
      type: "text",
      text: {
        content: toMarkdown(getDefaultData())
      }
    }, {
      parent: newJournalEntry
    });
    const flork = "brosk";
  }
}

class Pf2eShortRest {
  static id = "pf2e-short-rest";
  static flag = "pf2e-short-rest";
  static journalEntryName = "PF2E Short Rest";
  static templates = {
    application: `modules/${this.id}/templates/application.hbs`
  }
}

function getDefaultData() {
  return {
    florks: ["brosk1","brosk2","brosk3"]
  };
}

function toMarkdown(data) {
  const json = JSON.stringify(data, null, 2);
  const markdown = `<pre><code>${json}</pre></code>`;
  return markdown;
}

function fromMarkdown() {
  const dataPage = getJournalEntry().pages.getName("Data");
  const markdown = dataPage.text.content;
  const json = markdown.substring(11, markdown.length - 13); // <pre><code>...</pre></code>
  const data = JSON.parse(json);
  return data;
}

class Pf2eShortRestApplication extends FormApplication {

  static get defaultOptions() {
    const defaults = super.defaultOptions;

    const overrides = {
      height: "auto",
      id: "pf2e-short-rest",
      template: Pf2eShortRest.templates.application,
      title: "PF2E Short Rest",
      userId: game.userId,
    };

    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

    return mergedOptions;
  }

  getData(options) {
    return fromMarkdown();
  }
}