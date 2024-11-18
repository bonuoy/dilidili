const videoContainer = document.getElementById('video-container');
const videos = [];

let currentIndex = 0;
let currentVideo = null;

// 获取所有视频文件
async function getVideos() {
  try {
    const response = await fetch('/');
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const videoElements = doc.querySelectorAll('a[href$=".mp4"]');
    videoElements.forEach(element => {
      videos.push(element.href.split('/').pop());
    });
    videos.sort((a, b) => parseInt(a) - parseInt(b));
    loadVideo();
  } catch (error) {
    console.error('Failed to fetch videos:', error);
  }
}

function loadVideo() {
  if (currentVideo) {
    videoContainer.removeChild(currentVideo);
  }

  currentVideo = document.createElement('video');
  currentVideo.src = `/${videos[currentIndex]}`;
  currentVideo.autoplay = true;
  currentVideo.loop = true;
  currentVideo.controls = false;
  currentVideo.muted = true; // 默认静音
  videoContainer.appendChild(currentVideo);

  // 单击视频暂停或播放
  currentVideo.addEventListener('click', () => {
    if (currentVideo.paused) {
      currentVideo.play();
    } else {
      currentVideo.pause();
    }
  });

  // 触摸滑动支持
  let touchStartY = 0;
  let touchEndY = 0;

  videoContainer.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, false);

  videoContainer.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].clientY;
    if (touchEndY < touchStartY) { // 向下滑动
      nextVideo();
    } else if (touchEndY > touchStartY) { // 向上滑动
      prevVideo();
    }
  }, false);
}

function nextVideo() {
  currentIndex = (currentIndex + 1) % videos.length;
  loadVideo();
}

function prevVideo() {
  currentIndex = (currentIndex - 1 + videos.length) % videos.length;
  loadVideo();
}

// 初始化
getVideos();
