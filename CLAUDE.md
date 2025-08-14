# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個名為 "Autofill Jobs" 的 Chrome 擴充功能，使用 Vue.js 開發，用於自動填寫求職申請表單。專案支援多個招聘平台包括 Greenhouse、Lever、Dover 和 Workday。

## 建構指令

專案現在採用標準結構，在根目錄執行指令：

### 常用指令
- `npm i` - 安裝相依套件
- `npm run dev` - 啟動開發伺服器
- `npm run build` - 建構生產版本 (輸出到 `../dist/`)
- `npm run watch` - 監看 vue_src 目錄變化並自動建構

## 專案架構

### 檔案結構
- `src/` - Vue.js 前端原始碼
  - `App.vue` - 主應用程式組件，包含所有表單欄位
  - `components/` - 可重用的 Vue 組件
  - `composables/` - Vue 組合式函數
  - `assets/` - 靜態資源
- `public/` - Chrome 擴充功能公開資源
  - `manifest.json` - 擴充功能設定檔
  - `content-scripts/` - 內容腳本
    - `autofill.js` - 主要自動填寫邏輯
    - `utils.js` - 工具函數
    - `workday.js` - Workday 平台特定邏輯
  - `icons/` - 擴充功能圖示

### 技術堆疊
- Vue.js 3 (Composition API)
- JavaScript
- Vite (建構工具)
- Chrome Extensions Manifest V3

### 核心功能組件
- `InputField.vue` - 通用輸入欄位組件
- `GridDataField.vue` - 網格資料顯示組件
- `EnterWorkExperience.vue` / `EnterSkill.vue` - 工作經驗和技能輸入
- `PrivacyToggle.vue` - 隱私設定切換

### 內容腳本架構
擴充功能透過內容腳本在以下網站運作：
- greenhouse.io (求職平台)
- lever.co (求職平台)  
- dover.com (求職平台)
- workday.com 系列網站

內容腳本使用元素查詢和事件模擬來自動填寫表單欄位。

### 資料儲存
- 使用 `chrome.storage.sync` 儲存小型資料
- 使用 `chrome.storage.local` 儲存較大檔案（如履歷）

## 建構輸出

執行 `npm run build` 後，建構的擴充功能檔案會輸出到 `dist/` 資料夾，可直接載入到 Chrome 中進行測試。專案現在採用標準的前端專案結構。