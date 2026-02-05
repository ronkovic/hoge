# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "ログイン" [level=1] [ref=e4]
  - generic [ref=e5]:
    - textbox "ユーザー名" [ref=e7]
    - textbox "パスワード" [ref=e9]
    - button "ログイン" [ref=e10] [cursor=pointer]
  - navigation [ref=e11]:
    - link "Home" [ref=e12] [cursor=pointer]:
      - /url: /
    - text: "|"
    - link "Todos" [ref=e13] [cursor=pointer]:
      - /url: /todos
    - text: "|"
    - link "Dashboard" [ref=e14] [cursor=pointer]:
      - /url: /dashboard
```