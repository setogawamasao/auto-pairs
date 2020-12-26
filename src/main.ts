import * as fs from "fs";
import { promisify } from "util";
import * as webdriver from "selenium-webdriver";
import { Actions, Builder, By, until } from "selenium-webdriver";

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const capabilities = webdriver.Capabilities.chrome();
capabilities.set("chromeOptions", {
  args: [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    `--window-size=1980,1200`,
  ],
});

const init = async () => {
  // ブラウザ立ち上げ
  const driver = await new Builder().withCapabilities(capabilities).build();

  // pairsへ移動
  await driver.get("https://pairs.lv/login/email/");
  await wait(3000);

  // メールアドレスに値を入力
  await driver
    .findElement(By.className("input__1MMed typography-subtitle1"))
    .sendKeys("XXXXX@gmail.com");

  // フォーカスをアウトさせる
  await driver.actions().move({ x: 0, y: 0 }).perform();

  // ログインボタンを押下
  await driver
    .findElement(By.className("css-1ocvp0c-blueStyles-CircleButton"))
    .click();
  await wait(3000);

  // 数字入力画面遷移ボタンを押下
  await driver
    .findElement(By.className("css-1edqmbt-blueStyles-CircleButton"))
    .click();

  // 待つ
  const name = await readUserInput("input wait");

  const loopUser = async (): Promise<void> => {
    try {
      // ユーザーリンク
      const userElements = await driver.findElements(
        By.css(".css-pl2ngu-GridBox a button")
      );
      const userLinks: string[] = [];

      for (const userElement of userElements) {
        // click
        await userElement.click();
        await wait(1000);
        // close
        await driver
          .findElement(By.className("css-1hgrnjs-pointerStyles-ButtonProtect"))
          .click();
        await wait(500);
      }
    } catch (e) {
      console.log("userClick" + e);
    }
  };

  const loopCommunity = async (): Promise<void> => {
    // コミニティリンク
    const communityElements = await driver.findElements(
      By.css(".css-1ua7mb0-GridBox-CommunityListView a")
    );

    const communityLinks: string[] = [];

    for (const communityElement of communityElements) {
      communityLinks.push(await communityElement.getAttribute("href"));
    }

    for (const communityLink of communityLinks) {
      await driver.get(communityLink);
      await wait(2000);
      try {
        // 退会
        await driver
          .findElement(
            By.className(
              "button__8dUDv large__P1sN- typography-body1 red__2UKtX stretch__2W2Dx css-14a8wnk-pointerStyles"
            )
          )
          .click();
        await wait(4000);

        //　入会
        await driver
          .findElement(
            By.className(
              "button__8dUDv large__P1sN- typography-body1 stretch__2W2Dx css-14a8wnk-pointerStyles"
            )
          )
          .click();
        await wait(2000);
      } catch (e) {
        console.log("Community Click" + e);
      }
      // user click
      await loopUser();
    }
  };

  // loop start
  const categoryElements = await driver.findElements(
    By.css(".css-1mimn88-pointerStyles-ButtonText")
  );

  const categoryLinks: string[] = [];
  for (const categoryElement of categoryElements) {
    categoryLinks.push(await categoryElement.getAttribute("href"));
  }

  for (const categoryLink of categoryLinks) {
    await driver.get(categoryLink);
    await wait(3000);
    await loopCommunity();
  }
};

// ユーザからのキーボード入力を取得する Promise を生成する
const readUserInput = (question: string) => {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    readline.question(question, (answer: string) => {
      resolve(answer);
      readline.close();
    });
  });
};

const wait = (value: number) => {
  console.log(value);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, value);
  });
};

init();
