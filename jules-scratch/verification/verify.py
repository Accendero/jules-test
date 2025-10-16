from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173")
    page.set_input_files('input[type="file"]', 'spa-prototype/__mocks__/test-data.xlsx')
    page.screenshot(path="jules-scratch/verification/screenshot.png")
    browser.close()