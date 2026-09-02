(() => {
  const form = document.querySelector('#record-form');
  if (!form) return;

  const modeInputs = [...document.querySelectorAll('input[name="record-mode"]')];
  const panels = [...document.querySelectorAll('[data-mode-panel]')];
  const output = document.querySelector('#record-output');
  const copyButton = document.querySelector('#copy-record-output');
  const copyStatus = document.querySelector('#copy-status');
  const clearButton = document.querySelector('#clear-record-form');
  const storageKey = 'reading-log-record-form-v1';

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

  function serializeForm() {
    const values = {};
    [...form.elements].forEach((element) => {
      if (!element.name || element.name === 'record-mode') return;
      if (['button', 'submit'].includes(element.type)) return;
      values[element.name] = element.value;
    });
    return { mode: currentMode(), values };
  }

  function saveDraft() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(serializeForm()));
    } catch (_) {
      // localStorageが使えない環境では自動保存をスキップする。
    }
  }

  function loadDraft() {
    let draft;
    try {
      draft = JSON.parse(localStorage.getItem(storageKey));
    } catch (_) {
      draft = null;
    }

    if (draft?.mode) {
      const target = modeInputs.find((input) => input.value === draft.mode);
      if (target) target.checked = true;
    }

    if (draft?.values) {
      Object.entries(draft.values).forEach(([name, value]) => {
        const element = form.elements[name];
        if (element && typeof value === 'string') element.value = value;
      });
    }

    document.querySelectorAll('[data-default-today]').forEach((input) => {
      if (!input.value) input.value = todayInLocalTime();
    });

    showMode(currentMode());
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
      saveDraft();
      copyStatus.textContent = '';
    });
  });

  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    copyStatus.textContent = '';
    try {
      output.value = buildPrompt();
      copyButton.disabled = false;
      document.querySelector('#record-output-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      copyStatus.textContent = error.message;
    }
  });

  copyButton.addEventListener('click', async () => {
    if (!output.value) return;
    try {
      await navigator.clipboard.writeText(output.value);
      copyStatus.textContent = 'コピーしました。ChatGPTプロジェクト「読書管理」に貼り付けてください。';
    } catch (_) {
      output.focus();
      output.select();
      document.execCommand('copy');
      copyStatus.textContent = 'コピーしました。ChatGPTプロジェクト「読書管理」に貼り付けてください。';
    }
  });

  clearButton.addEventListener('click', () => {
    if (!window.confirm('入力中の内容をすべて消しますか？')) return;
    form.reset();
    modeInputs[0].checked = true;
    document.querySelectorAll('[data-default-today]').forEach((input) => {
      input.value = todayInLocalTime();
    });
    showMode('new');
    output.value = '';
    copyButton.disabled = true;
    copyStatus.textContent = '';
    try { localStorage.removeItem(storageKey); } catch (_) {}
  });

  loadDraft();
})();
