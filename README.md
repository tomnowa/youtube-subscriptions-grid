# YouTube Subscriptions – Grid View by Default

sick of youtube forcing the “by channel” subscriptions view?  
this tiny chrome extension fixes it. every time you click **Subscriptions**, you’ll get the clean grid view again (`flow=1`). no reload flicker, no loops.

---

## how it works
- silently redirects `/feed/subscriptions` → `/feed/subscriptions?flow=1`
- patches links and in-page navigation so you always land on the grid view
- zero extra permissions, no background bloat

---

## install

### easy way (for dev mode users)
1. download this repo (green “Code” → Download ZIP, or `git clone` it).
2. unzip somewhere permanent.
3. open **chrome://extensions**.
4. enable **Developer mode** (toggle in top-right).
5. click **Load unpacked**, pick the folder.

that’s it. test by clicking “Subscriptions” in the sidebar.

---

## screenshots
*(add a before/after shot of subscriptions view here)*

---

## faq
**does it collect data?**  
no. there’s no background script, no analytics, no remote calls. it just patches urls.

**will it break if youtube changes stuff?**  
maybe. it’s youtube. but the logic is simple and easy to update.

**firefox?**  
should work with minimal tweaks. firefox supports manifest v3 now, so porting is trivial.

---

## license
MIT – do what you want, just don’t sell it back to me.
