import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  fullyParallel:false,
  forbidOnly:Boolean(process.env.CI),
  retries:process.env.CI?1:0,
  workers:1,
  timeout:35_000,
  expect:{timeout:8_000},
  reporter:process.env.CI?[['line'],['html',{open:'never'}]]:[['list']],
  use:{
    baseURL:process.env.BASE_URL||'http://127.0.0.1:4173',
    serviceWorkers:'allow',
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
    video:'retain-on-failure'
  },
  projects:[
    {name:'chromium-desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},
    {name:'chromium-mobile',use:{...devices['Desktop Chrome'],viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
    {name:'webkit-desktop',use:{...devices['Desktop Safari'],viewport:{width:1440,height:900}}},
    {name:'webkit-mobile',use:{...devices['iPhone 13'],viewport:{width:390,height:844},reducedMotion:'reduce'}}
  ],
  webServer:{
    command:'node scripts/test-server.mjs',
    url:'http://127.0.0.1:4173/__test__/health',
    reuseExistingServer:false,
    timeout:20_000
  }
});
