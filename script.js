const videoContainer = document.getElementById('video-container');
const uploadForm = document.getElementById('upload-form');
const videos = [];

let currentIndex = 0;
let currentVideo = null;

// 获取所有视频文件
function getVideos() {
  fetch('/')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const videoElements = doc.querySelectorAll('a[href$=".mp4"]');
      videoElements.forEach(element => {
        videos.push(element.href.split('/').pop());
      });
      videos.sort((a, b) => parseInt(a) - parseInt(b));
      loadVideo();
    });
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

// 处理文件上传
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(uploadForm);
  const file = formData.get('video');

  // 生成不重复的文件名
  const files = await fetch('/').then(response => response.text()).then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const videoElements = doc.querySelectorAll('a[href$=".mp4"]');
    return Array.from(videoElements).map(element => element.href.split('/').pop());
  });

  const existingNumbers = files.map(file => parseInt(file)).filter(Number.isInteger);
  const nextNumber = Math.max(...existingNumbers, 0) + 1;
  const newFileName = `${nextNumber}.mp4`;

  // 上传文件
  const response = await fetch(`/`, {
    method: 'POST',
    body: formData,
    headers: {
      'X-New-FileName': newFileName
    }
  });

  if (response.ok) {
    getVideos(); // 重新获取视频列表
  } else {
    alert('上传失败');
  }
});

// 初始化
getVideos();