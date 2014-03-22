$(document).ready(function onDOMReady() {
  navigator.getUserMedia = (navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia ||
                            false);
  window.URL = (window.URL || window.webkitURL || false);

  var webcamModal = $('#modal_upload_photo');
  var webcamVideo = $('#video_upload_photo').get(0);
  var webcamCanvas = $('#canvas_upload_photo').get(0);
  var webcamCtx = webcamCanvas.getContext('2d');
  var webcamSnapBtn = $('#btn_take_photo');
  var webcamTimer = $('#photo_timer');
  var mediaStream = null;

  function stopVideo() {
    if (mediaStream == null) {
      return;
    }
    webcamVideo.pause();
    if (window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL(webcamVideo.src);
    }
    webcamVideo.src = '';
    mediaStream.stop();
    mediaStream = null;
  }

  function startVideo(stream) {
    mediaStream = stream;
    webcamVideo.src = window.URL.createObjectURL(stream);
  }

  function onGetStreamSuccess(stream) {
    webcamSnapBtn.prop('disabled', false);
    startVideo(stream);
  }

  function onGetStreamFail() {
    // NOTE: this shouldn't happen, since we control the admin dashboard :)
  }

  $('.btn-upload-photo').click(function onUploadPhotoClick() {
    var code = $(this).attr('data-code');
    $('#photo_user_code').val(code);
  });

  webcamModal.on('shown.bs.modal', function onUploadPhotoModalShown() {
    webcamSnapBtn.prop('disabled', true);
    navigator.getUserMedia(
      {video: true},
      onGetStreamSuccess,
      onGetStreamFail);
  });
  webcamModal.on('hide.bs.modal', function onUploadPhotoModalHide() {
    stopVideo();
    webcamTimer.addClass('hide');
    webcamSnapBtn.prop('disabled', false);
  });

  var TIMER_DURATION = 3000;

  function updateTimer(ms) {
    var secondsRemaining = Math.ceil((TIMER_DURATION - ms) / 1000);
    webcamTimer.text(secondsRemaining);
  }

  function dataURLToBlob(dataURL) {
    var binary = atob(dataURL.split(',')[1]),
        array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
  }

  function getPhotoCredentials(code, callback) {
    $.getJSON('/api/users/' + code + '/photoCredentials')
      .done(callback);
  }

  function initiateUpload(code, credentials, dataURL) {
    var formData = new FormData();
    _.each(credentials, function appendFormData(value, key) {
      formData.append(key, value);
    });
    var filename = credentials.key.substring('images/'.length);
    formData.append(
      'file',
      dataURLToBlob(dataURL),
      filename);
    $.ajax({
      url: 'https://k4hoedown.s3.amazonaws.com',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false
    }).done(function() {
      var imgId = 'profile_pic_' + code;
      var imgElem = document.getElementById(imgId);
      imgElem.src = 'https://k4hoedown.s3.amazonaws.com/' + credentials.key;
      webcamTimer.addClass('hide');
      webcamSnapBtn.prop('disabled', false);
      webcamModal.modal('hide');
    }).fail(function() {
      console.log(arguments);
    });
  }

  function snapPhoto(interval) {
    window.clearInterval(interval);
    webcamTimer.text('Uploading...');

    webcamCanvas.width = webcamVideo.videoWidth;
    webcamCanvas.height = webcamVideo.videoHeight;
    webcamCtx.drawImage(webcamVideo, 0, 0);
    var dataURL = webcamCanvas.toDataURL('image/jpeg');
    stopVideo();
    var code = $('#photo_user_code').val();
    getPhotoCredentials(code, function(credentials) {
      console.log(JSON.stringify(credentials));
      initiateUpload(code, credentials, dataURL);
    });
  }

  webcamSnapBtn.click(function onSnapPhoto() {
    var start = +new Date();
    updateTimer(0);
    webcamTimer.removeClass('hide');
    webcamSnapBtn.prop('disabled', true);
    var interval = window.setInterval(function() {
      var ms = +new Date() - start;
      if (ms > TIMER_DURATION) {
        snapPhoto(interval);
      }
      updateTimer(ms);
    }, 100);
  });
});
