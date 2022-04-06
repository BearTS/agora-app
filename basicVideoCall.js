import AgoraRTC from "agora-rtc-sdk-ng";
let rtc = {
    localAudioTrack: null,
    localVideoTrack: null,
    client: null,
};
let options = {
    appId: "<AppID>",
    channel: "test",
    token: null,
};
async function startBasicCall() {
    rtc.client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
    rtc.client.on("user-published", async (user, mediaType) => {
        await rtc.client.subscribe(user, mediaType);
        if (mediaType === "video") {
            const remoteVideoTrack = user.videoTrack;
            const remotePlayerContainer = document.createElement("div");
            remotePlayerContainer.id = user.uid.toString();
            remotePlayerContainer.textContent = "Remote user " + user.uid.toString();
            remotePlayerContainer.style.width = "640px";
            remotePlayerContainer.style.height = "480px";
            document.body.append(remotePlayerContainer);
            remoteVideoTrack.play(remotePlayerContainer);
        }

        if (mediaType === "audio") {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play();
        }
        rtc.client.on("user-unpublished", user => {
            const remotePlayerContainer = document.getElementById(user.uid);
            remotePlayerContainer.remove();
        });
    });

    window.onload = function () {
        document.getElementById("join").onclick = async function () {
            await rtc.client.join(options.appId, options.channel, options.token, options.uid);
            rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
            await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
            const localPlayerContainer = document.createElement("div");
            localPlayerContainer.id = options.uid;
            localPlayerContainer.textContent = "Local user " + options.uid;
            localPlayerContainer.style.width = "640px";
            localPlayerContainer.style.height = "480px";
            document.body.append(localPlayerContainer);
            rtc.localVideoTrack.play(localPlayerContainer);
            console.log("publish success!");
        };

        document.getElementById("leave").onclick = async function () {
            rtc.localAudioTrack.close();
            rtc.localVideoTrack.close();
            rtc.client.remoteUsers.forEach(user => {
                const playerContainer = document.getElementById(user.uid);
                playerContainer && playerContainer.remove();
            });
            await rtc.client.leave();
        };
    };
}

startBasicCall();