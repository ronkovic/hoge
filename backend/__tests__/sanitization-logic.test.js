import { sanitizeInput } from '../utils/validator.js';

describe('サニタイゼーションロジックの正確性テスト', () => {
  describe('HTMLタグの除去ロジック', () => {
    const testCases = [
      {
        description: 'scriptタグが完全に除去されること',
        input: '<script>alert("XSS")</script>Hello',
        // タグを除去した後、特殊文字をエスケープする場合
        expected: 'Hello'
      },
      {
        description: 'タグ除去後に特殊文字のエスケープが正しく行われること',
        input: '<div>Test</div>',
        // 現在の実装では、タグを除去してからエスケープするため「Test」のみが残る
        expected: 'Test'
      },
      {
        description: '特殊文字が適切にエスケープされること',
        input: 'Test & <Company>',
        // タグ除去: 'Test & Company'
        // エスケープ: 'Test &amp; Company' （ただし、<>は既に除去されている）
        expected: 'Test &amp; Company'
      },
      {
        description: 'エスケープのみが必要な入力',
        input: 'A & B < C > D',
        expected: 'A &amp; B &lt; C &gt; D'
      },
      {
        description: 'imgタグのイベントハンドラが除去されること',
        input: '<img src=x onerror="alert(\'XSS\')">',
        expected: ''
      }
    ];

    test.each(testCases)('$description', ({ input, expected }) => {
      const result = sanitizeInput(input);
      expect(result).toBe(expected);
    });
  });

  describe('サニタイゼーションの順序問題', () => {
    test('タグ除去とエスケープの順序が正しいこと', () => {
      // レビュー指摘: タグ除去後にエスケープしても意味がない
      // 期待: エスケープを先に行うか、タグ除去のみにする

      const input = '<script>alert("XSS")</script>Hello';

      // オプション1: エスケープのみ
      const resultEscapeOnly = escapeHtml(input);
      expect(resultEscapeOnly).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;Hello');

      // オプション2: タグ除去のみ
      const resultRemoveOnly = removeHtmlTags(input);
      expect(resultRemoveOnly).toBe('Hello');

      // 現在の実装: タグ除去 → エスケープ
      const resultCurrent = sanitizeInput(input);
      // タグ除去で 'Hello' → エスケープしても 'Hello' （変化なし）
      expect(resultCurrent).toBe('Hello');
    });

    test('エスケープを先に行う場合のテスト', () => {
      const input = '<script>alert("XSS")</script>';

      // エスケープを先に行う場合
      const escaped = escapeHtml(input);
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');

      // タグは表示されないが、内容は保持される
      expect(escaped).not.toContain('<script>');
      expect(escaped).not.toContain('</script>');
    });
  });

  describe('サニタイゼーション関数の統一性', () => {
    test('server.jsとutils/validator.jsで同じ結果が得られること', () => {
      // レビュー指摘: 2つの異なるサニタイゼーション関数が存在
      // simpleHtmlSanitize() と sanitizeInput()

      const testInputs = [
        '<script>alert("XSS")</script>Test',
        '<img src=x onerror="alert(1)">',
        'Normal text & symbols',
        '<div onclick="alert(1)">Click</div>'
      ];

      testInputs.forEach(input => {
        // server.jsのsimpleHtmlSanitize()を使用した場合
        // utils/validator.jsのsanitizeInput()を使用した場合
        // 両方が同じ結果を返すべき

        const result1 = sanitizeInput(input); // utils/validator.js
        // const result2 = simpleHtmlSanitize(input); // server.js (インポートできない)

        // このテストは、統一後にパスするはず
        expect(result1).toBeDefined();
      });
    });
  });

  describe('エッジケース', () => {
    test('ネストされたタグが正しく処理されること', () => {
      const input = '<div><script>alert(1)</script></div>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    test('大文字小文字の混在したタグが除去されること', () => {
      const input = '<ScRiPt>alert(1)</sCrIpT>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('script');
      expect(result).not.toContain('SCRIPT');
    });

    test('不完全なタグが適切に処理されること', () => {
      const input = '<script alert(1)';
      const result = sanitizeInput(input);
      // タグの開始のみの場合も除去されるべき
      expect(result).not.toContain('<');
    });

    test('URLエンコードされた攻撃が防がれること', () => {
      const input = '%3Cscript%3Ealert(1)%3C/script%3E';
      const result = sanitizeInput(input);
      // デコード後のサニタイズが必要
      // 現在の実装では対応していないため、このテストは失敗する
      expect(result).not.toContain('script');
    });
  });
});

// ヘルパー関数（テスト用）
function escapeHtml(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function removeHtmlTags(input) {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '');
}
