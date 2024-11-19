function changeVideo(src) {
    var video = document.getElementById('videoPlayer');
    video.src = src;  // 这里设置了视频文件的实际路径，使用从根目录开始的路径
    video.load();     // 重新加载视频资源
    video.play();     // 开始播放视频
}
