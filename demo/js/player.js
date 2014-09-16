var Player = (function(window, document, undefined) {

	var player      = document.querySelector("#player"),
	btnPlayPause    = document.querySelector("#play-pause"),
	btnPrev 	      = document.querySelector("#prev"),
	btnNext 	      = document.querySelector("#next"),
	btnRepeat 	    = document.querySelector("#repeat"),
	btnRandom 	    = document.querySelector("#random"),
	volumeControl   = document.querySelector("#volume"),
	timeLine        = document.querySelector("#timeline"),
	musicTimeCount  = document.querySelector("#time-count"),
	musicTime       = document.querySelector("#time"),
	musicName       = document.querySelector("#music-name"),
	playListElement = document.querySelector("#play-list"),
	loading         = document.querySelector("#loading-music"),
  currentTrack    = 0,
  isPlaying       = false,
	playList 	      = [];

	//atacha a musica passada como argumento no player
	var playMusic = function(track) {
		
		var reader = new FileReader();

		reader.onloadstart = showLoading();

		reader.onload = function(e) {
			player.src = reader.result;
		}

		reader.readAsDataURL(Player.playList[track]);

		Player.currentTrack = parseInt(track);

		player.onloadeddata = function() {
			play(track, parseInt( player.getAttribute('data-current-track')) );
			setTimeLineMax(player.duration);
			setMusicTime(player.duration);
			setMusicName(Player.playList[track].name);

			hideLoading();
		};
		
	};

	//toca ou pausa a musica
	var playPause = function() {

		if (player.src == "") return false;

		if (Player.isPlaying === false) {
				play();
		} else {
				pause();
		}
		
	};

	var play = function(track, lastTrack) {
		if (player.src == "") return false;
		Player.isPlaying = true;
		btnPlayPause.classList.remove("icon-play");
		btnPlayPause.classList.add("icon-pause");
		player.play(); //metodo nativo do objeto HTMLAudioElement
		player.setAttribute("data-current-track", track);

		document.querySelector("#list-icon-"+lastTrack).classList.remove("playing");
		document.querySelector("#list-icon-"+track).classList.add("playing");
	};

	var pause = function() {
		if (player.src == "") return false;
		Player.isPlaying = false;
		btnPlayPause.classList.remove("icon-pause");
		btnPlayPause.classList.add("icon-play");
		player.pause(); //metodo nativo do objeto HTMLAudioElement
	};

	var playPrev = function() {
		if (player.src == "") return false;
		var prev = Player.currentTrack - 1;
		
		(prev > -1) ? playMusic(prev) : playMusic(0);
	};

	var playNext = function() {
		if (player.src == "") return false;

		var next = Player.currentTrack + 1;
		var lastMusic = Player.playList.length - 1;

		if (btnRandom.getAttribute("data-random") == "false") {
			(next <= lastMusic) ? playMusic(next) : playMusic(0) ;
		} else {
			var random = Math.round( Math.random() * (lastMusic) );
			playMusic(random);
		}

	};

	var repeat = function() {
		switch (btnRepeat.getAttribute("data-repeat")) {
			case "false":
				btnRepeat.classList.add("on");
				btnRepeat.setAttribute("data-repeat", "true");
				player.setAttribute("loop", "");
			break;
			case "true":
				btnRepeat.classList.remove("on");
				btnRepeat.setAttribute("data-repeat", "false");
				player.removeAttribute("loop");
			break;
		}
	};

	var randomize = function() {
		switch (btnRandom.getAttribute("data-random")) {
			case "false":
				btnRandom.classList.add('on');
				btnRandom.setAttribute("data-random", "true");
			break;
			case "true":
				btnRandom.classList.remove('on');
				btnRandom.setAttribute("data-random", "false");
			break;
		}
	};

	var changeVolume = function() {
		player.volume = volumeControl.value / 10;
	};

	var changeTime = function() {
		if (player.readyState != 0) player.currentTime = timeLine.value;
	};

	var timeLineUpdate = function() {
		timeLine.value = player.currentTime;
	};

	var setTimeLineMax = function(time) {
		timeLine.setAttribute( "max", Math.round(time) );
	};

	var setMusicTime = function(time) {
		musicTime.innerHTML = convertTime(time);
	};

	var musicCountUpdate = function(time) {
		musicTimeCount.innerHTML = convertTime(time);
	};

	var setMusicName = function(name) {
		musicName.innerHTML = name.replace(".mp3", "");
	};

	var createPlayList = function() {
		var listItem, musicName;
		playListElement.innerHTML = "";
		for (var i = 0, len = Player.playList.length; i < len; i++) {
			musicName = Player.playList[i].name.replace(".mp3", "");

			var li = document.createElement("li");
			var button = document.createElement("button");
			var span = document.createElement("span");
			li.setAttribute("class", "list-item");
			button.setAttribute("type", "button");
			button.setAttribute("class", "btn player-btn small icon icon-play");
			span.setAttribute("id", "list-icon-"+i);
			span.setAttribute("class", "list-icon icon icon-headphones");

			li.appendChild(button);
			li.innerHTML += musicName;
			li.appendChild(span);
			playListElement.appendChild(li);
		};
	};

	var showLoading = function() {
		loading.classList.add("show");
	};

	var hideLoading = function() {
		loading.classList.remove("show");
	};

	var convertTime = function(time) {

		if (isNaN(time) || time == "" || typeof time != 'number') return "00:00";

		var hours   = parseInt( time / 3600 ) % 24;
		var minutes = parseInt( time / 60 ) % 60;
		var seconds = parseInt( time % 60);

		if (hours > 0) {
			var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);	
		} else {
			var result = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);	
		}

		return result;

	}

	//botões
	btnPlayPause.addEventListener("click", playPause, false);
	btnPrev.addEventListener("click", playPrev, false);
	btnNext.addEventListener("click", playNext, false);
	btnRepeat.addEventListener("click", repeat, false);
	btnRandom.addEventListener("click", randomize, false);
	
	//volume
	volumeControl.addEventListener("change", changeVolume, false);
	
	//timeLine
	timeLine.addEventListener("change", changeTime, false);
	timeLine.addEventListener("mousedown", function() {
		player.removeEventListener("timeupdate", timeLineUpdate);
	}, false);
	timeLine.addEventListener("mouseup", function() {
		player.addEventListener("timeupdate", timeLineUpdate, false);
	}, false);

	//player
	player.addEventListener("ended", playNext, false);
	player.addEventListener("timeupdate", timeLineUpdate, false);
	player.addEventListener("timeupdate", function(){musicCountUpdate( Math.floor(this.currentTime) );} , false);

	return {
		playList: playList,
		playMusic: playMusic,
		createPlayList: createPlayList
	}

})(window, document);