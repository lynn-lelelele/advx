<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";

onLaunch(() => {
  console.log("Echo App Launch");
});

onShow(() => {
  console.log("Echo App Show");
});

onHide(() => {
  console.log("Echo App Hide");
});
</script>

<style>
/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #fef8f2;
  color: #5c3d2e;
  font-size: 28rpx;
  line-height: 1.6;
}

/* 去除默认边距 */
view, text, image, scroll-view {
  box-sizing: border-box;
}

/* 滚动条优化 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
</style>
