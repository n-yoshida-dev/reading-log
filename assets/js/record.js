(() => {
  const form = document.querySelector('#record-form');
  if (!form) return;

  const modeInputs = [...document.querySelectorAll('input[name="record-mode"]')];
  const panels = [...document.querySelectorAll('[data-mode-panel]')];
  const output = document.querySelector('#record-output');
  const copyButton = document.querySelector('#copy-record-output');
  const copyOpenButton = document.querySelector('#copy-open-record-output');
  const copyStatus = document.querySelector('#copy-status');
  const clearButton = document.querySelector('#clear-record-form');
  const chatgptSetting = document.querySelector('#chatgpt-setting');
  const chatgptUrlInput = document.querySelector('#chatgpt-project-url');
  const chatgptUrlSave = document.querySelector('#save-chatgpt-project-url');
  const chatgptUrlClear = document.querySelector('#clear-chatgpt-project-url');
  const chatgptUrlStatus = document.querySelector('#chatgpt-setting-status');
  const legacyStorageKey = 'reading-log-record-form-v1';
  const chatgptUrlStorageKey = 'reading-log-chatgpt-project-url-v1';

  const text = (name) => (form.elements[name]?.value || '').trim();
  const line = (label, value) => value ? `- ${label}: ${value}` : '';
  const block = (label, value) => value ? `\n### ${label}\n${value}` : '';

  function todayInLocalTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function currentMode() {
    return modeInputs.find((input) => input.checked)?.value || 'new';
  }

  function showMode(mode) {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.modePanel !== mode;
    });
  }

  function normalizeSearch(value) {
    return String(value || '').normalize('NFKC').toLocaleLowerCase('ja');
  }

  function initBookPicker(picker) {
    const search = picker.querySelector('[data-book-search]');
    const value = picker.querySelector('[data-book-value]');
    const menu = picker.querySelector('[data-book-menu]');
    const optionContainer = picker.querySelector('[data-book-options]');
    const empty = picker.querySelector('[data-book-empty]');
    const result = picker.querySelector('[data-book-result]');
    const clear = picker.querySelector('[data-book-clear]');
    const statusOrder = { reading: 0, unread: 1, paused: 2, finished: 3, skimmed: 4, abandoned: 5 };
    const options = [...picker.querySelectorAll('[data-book-option]')].sort((a, b) => {
      const statusDifference = (statusOrder[a.dataset.status] ?? 9) - (statusOrder[b.dataset.status] ?? 9);
      if (statusDifference) return statusDifference;
      const orderDifference = Number(a.dataset.readingOrder || 9999) - Number(b.dataset.readingOrder || 9999);
      return orderDifference || a.dataset.title.localeCompare(b.dataset.title, 'ja');
    });
    let visibleOptions = options;
    let activeIndex = -1;

    options.forEach((option) => optionContainer.appendChild(option));

    function setExpanded(expanded) {
      menu.hidden = !expanded;
      search.setAttribute('aria-expanded', String(expanded));
      if (!expanded) {
        search.removeAttribute('aria-activedescendant');
        options.forEach((option) => option.classList.remove('is-active'));
        activeIndex = -1;
      }
    }

    function setActive(index) {
      if (!visibleOptions.length) return;
      activeIndex = (index + visibleOptions.length) % visibleOptions.length;
      visibleOptions.forEach((option, optionIndex) => {
        option.classList.toggle('is-active', optionIndex === activeIndex);
      });
      const active = visibleOptions[activeIndex];
      search.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView({ block: 'nearest' });
    }

    function selectOption(option, { close = true } = {}) {
      value.value = option?.dataset.title || '';
      search.value = value.value;
      clear.hidden = !value.value;
      options.forEach((candidate) => {
        candidate.setAttribute('aria-selected', String(candidate === option));
      });
      if (close) setExpanded(false);
    }

    function filterOptions() {
      const query = normalizeSearch(search.value).trim();
      const tokens = query.split(/\s+/).filter(Boolean);
      visibleOptions = options.filter((option) => {
        const haystack = normalizeSearch(option.dataset.search);
        const compactHaystack = haystack.replace(/[\s\-‐‑‒–—―・「」『』【】（）()]/g, '');
        const matches = tokens.every((token) => {
          const compactToken = token.replace(/[\s\-‐‑‒–—―・「」『』【】（）()]/g, '');
          return haystack.includes(token) || compactHaystack.includes(compactToken);
        });
        option.hidden = !matches;
        return matches;
      });
      empty.hidden = visibleOptions.length > 0;
      const suffix = query ? '件' : '冊';
      result.textContent = query
        ? `${visibleOptions.length}${suffix}見つかりました。`
        : `全${visibleOptions.length}${suffix}。読書中・積読を先に表示します。`;
      setExpanded(true);
      activeIndex = -1;
      options.forEach((option) => option.classList.remove('is-active'));
      search.removeAttribute('aria-activedescendant');
    }

    search.addEventListener('focus', filterOptions);
    search.addEventListener('click', filterOptions);
    search.addEventListener('input', () => {
      value.value = '';
      clear.hidden = !search.value;
      options.forEach((option) => option.setAttribute('aria-selected', 'false'));
      filterOptions();
    });
    search.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (menu.hidden) filterOptions();
        setActive(activeIndex + 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (menu.hidden) filterOptions();
        setActive(activeIndex - 1);
      } else if (event.key === 'Enter' && !menu.hidden && visibleOptions.length) {
        event.preventDefault();
        selectOption(visibleOptions[activeIndex >= 0 ? activeIndex : 0]);
      } else if (event.key === 'Escape') {
        setExpanded(false);
      }
    });
    search.addEventListener('blur', () => {
      window.setTimeout(() => {
        const exact = options.find((option) => option.dataset.title === search.value.trim());
        if (!value.value && exact) selectOption(exact);
        setExpanded(false);
      }, 120);
    });

    options.forEach((option) => {
      option.addEventListener('mousedown', (event) => event.preventDefault());
      option.addEventListener('click', () => selectOption(option));
    });

    clear.addEventListener('mousedown', (event) => event.preventDefault());
    clear.addEventListener('click', () => {
      selectOption(null);
      search.focus();
      filterOptions();
    });

    picker.syncFromValue = () => {
      const selected = options.find((option) => option.dataset.title === value.value);
      selectOption(selected || null);
    };
  }

  function syncBookPickersFromValues() {
    document.querySelectorAll('[data-book-picker]').forEach((picker) => picker.syncFromValue?.());
  }

  function clearLegacyDraft() {
    try { localStorage.removeItem(legacyStorageKey); } catch (_) {}
  }

  function resetRecordForm() {
    form.reset();
    modeInputs[0].checked = true;
    document.querySelectorAll('[data-default-today]').forEach((input) => {
      input.value = todayInLocalTime();
    });
    showMode('new');
    output.value = '';
    copyButton.disabled = true;
    copyOpenButton.disabled = true;
    copyStatus.textContent = '';
    syncBookPickersFromValues();
  }

  function buildNewBookPrompt() {
    const title = text('new_title');
    if (!title) throw new Error('本のタイトルを入力してください。');

    const details = [
      line('タイトル', title),
      line('著者', text('new_author')),
      line('ISBN', text('new_isbn')),
      line('カテゴリ', text('new_category')),
      line('最初の状態', text('new_status')),
      line('書誌情報・Amazon情報', text('new_bibliography')),
    ].filter(Boolean).join('\n');

    return `reading-logに次の本を登録してください。\n既存のAI_RULES.mdとtemplates/book.mdに従い、同名・同ISBNの重複を確認してからGitHubへ反映してください。\n書誌情報は推測で埋めず、入力から確定できない項目は空欄のままで構いません。\n\n${details}${block('買った／読もうと思った理由', text('new_reason'))}${block('読む目的・得たいこと', text('new_purpose'))}\n\n私の言葉の意味を変えずに整理してください。反映後、変更したファイルと内容を教えてください。`;
  }

  function buildProgressPrompt() {
    const book = text('progress_book');
    if (!book) throw new Error('本を選択してください。');

    const details = [
      line('日付', text('progress_date')),
      line('進捗', text('progress_amount')),
    ].filter(Boolean).join('\n');

    return `reading-logの「${book}」に読書ログを追記してください。\n既存の本ファイルとAI_RULES.mdを確認し、過去のメモは削除・要約せず、その日の記録としてGitHubへ反映してください。\n\n${details}${block('気になったこと・覚えておきたいこと', text('progress_note'))}${block('自分はどう考えたか', text('progress_thought'))}${block('自分に試すなら', text('progress_apply'))}\n\n私の言葉を優先し、AIの解釈を私の感想として追加しないでください。反映後、変更したファイルと内容を教えてください。`;
  }

  function buildReviewPrompt() {
    const book = text('review_book');
    if (!book) throw new Error('本を選択してください。');

    const statusLabels = {
      finished: '読了',
      skimmed: '拾い読みで完了',
      abandoned: '途中で中止',
    };
    const rating = text('review_rating');
    const details = [
      line('完了方法', statusLabels[text('review_status')] || text('review_status')),
      line('評価', rating ? `${rating}/5` : ''),
    ].filter(Boolean).join('\n');

    return `reading-logの「${book}」を読了後の記録として更新してください。\n既存の「読む目的」とこれまでの読書ログも確認し、AI_RULES.mdに従ってstatus・progress・user_rating・感想・要約・アクションを必要な範囲でGitHubへ反映してください。\n私の感想は意味を変えず、無理に前向きな結論やアクションを足さないでください。\n\n${details}${block('最初の目的・期待に対してどうだったか', text('review_expectation'))}${block('良かった・刺さった・役立ちそうだった点', text('review_good'))}${block('微妙だった・合わなかった・納得できなかった点', text('review_bad'))}${block('読んで自分の考えがどう変わったか', text('review_thought'))}${block('自分の言葉での一言要約', text('review_summary'))}${block('実際にやること', text('review_action'))}\n\n空欄は無理に補わなくて構いません。反映後、変更したファイルと内容を教えてください。`;
  }

  function buildPrompt() {
    switch (currentMode()) {
      case 'progress': return buildProgressPrompt();
      case 'review': return buildReviewPrompt();
      default: return buildNewBookPrompt();
    }
  }

  modeInputs.forEach((input) => {
    input.addEventListener('change', () => {
      showMode(input.value);
      copyStatus.textContent = '';
    });
  });


  form.addEventListener('submit', (event) => {
    event.preventDefault();
    copyStatus.textContent = '';
    try {
      output.value = buildPrompt();
      copyButton.disabled = false;
      copyOpenButton.disabled = false;
      document.querySelector('#record-output-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      copyStatus.textContent = error.message;
    }
  });

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output.value);
      return true;
    } catch (_) {
      output.focus();
      output.select();
      try { return document.execCommand('copy'); } catch (_) { return false; }
    }
  }

  function readStoredChatgptUrl() {
    try { return localStorage.getItem(chatgptUrlStorageKey) || ''; } catch (_) { return ''; }
  }

  function parseChatgptUrl(value) {
    try {
      const url = new URL(value);
      const isChatgptHost = url.hostname === 'chatgpt.com' || url.hostname.endsWith('.chatgpt.com');
      return url.protocol === 'https:' && isChatgptHost ? url.href : '';
    } catch (_) {
      return '';
    }
  }

  function showChatgptUrlState() {
    const savedUrl = readStoredChatgptUrl();
    chatgptUrlInput.value = savedUrl;
    chatgptUrlClear.hidden = !savedUrl;
    chatgptUrlStatus.textContent = savedUrl ? '設定済みです。この端末だけに保存されています。' : '';
  }

  copyButton.addEventListener('click', async () => {
    if (!output.value) return;
    const copied = await copyOutput();
    copyStatus.textContent = copied
      ? 'コピーしました。'
      : '自動コピーに失敗しました。上の文章を選択してコピーしてください。';
  });

  copyOpenButton.addEventListener('click', async () => {
    if (!output.value) return;
    const copied = await copyOutput();
    if (!copied) {
      copyStatus.textContent = '自動コピーに失敗しました。上の文章を選択してコピーしてください。';
      return;
    }

    const projectUrl = parseChatgptUrl(readStoredChatgptUrl());
    if (!projectUrl) {
      copyStatus.textContent = 'コピーしました。最初の1回だけ、下にChatGPTプロジェクトのURLを設定してください。';
      chatgptSetting.open = true;
      chatgptUrlInput.focus();
      chatgptSetting.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    copyStatus.textContent = 'コピーしました。ChatGPTを開きます。';
    window.setTimeout(() => window.location.assign(projectUrl), 120);
  });

  chatgptUrlSave.addEventListener('click', () => {
    const projectUrl = parseChatgptUrl(chatgptUrlInput.value.trim());
    if (!projectUrl) {
      chatgptUrlStatus.textContent = 'https://chatgpt.com で始まるプロジェクトのURLを入力してください。';
      return;
    }
    try {
      localStorage.setItem(chatgptUrlStorageKey, projectUrl);
      showChatgptUrlState();
    } catch (_) {
      chatgptUrlStatus.textContent = 'このブラウザには保存できませんでした。プライベートブラウズ等を解除して再度お試しください。';
    }
  });

  chatgptUrlInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    chatgptUrlSave.click();
  });

  chatgptUrlClear.addEventListener('click', () => {
    try { localStorage.removeItem(chatgptUrlStorageKey); } catch (_) {}
    showChatgptUrlState();
  });

  clearButton.addEventListener('click', () => {
    if (!window.confirm('入力中の内容をすべて消しますか？')) return;
    resetRecordForm();
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) resetRecordForm();
  });

  document.querySelectorAll('[data-book-picker]').forEach(initBookPicker);
  clearLegacyDraft();
  resetRecordForm();
  showChatgptUrlState();
})();
