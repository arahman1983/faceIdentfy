const imageUpload = document.getElementById('imageUpload');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startRecognition)


function startRecognition () {
    const container = document.createElement('div');
    container.style.position = 'relative';
    document.body.append(container)
    imageUpload.addEventListener('change', async ()=>{
        const imageLoaded = await faceapi.bufferToImage(imageUpload.files[0])
        imageLoaded.style.width = 500
        container.append(imageLoaded)

        const canvas = faceapi.createCanvasFromMedia(imageLoaded)
        container.append(canvas)
        const canDisplaySize = {width: imageLoaded.width, height:imageLoaded.height}
        faceapi.matchDimensions(canvas, canDisplaySize)
        
        const detections = await faceapi.detectAllFaces(imageLoaded).withFaceLandmarks().withFaceDescriptors()

        const resizedDetections = faceapi.resizeResults(detections, canDisplaySize);
        // canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height)
        resizedDetections.forEach(detection => {
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {label: 'face'})
            drawBox.draw(canvas)
            loadLabeledImages()
        })
    })
}

function loadLabeledImages () {
    const labels = ['Abdelrahman Elhussiny']

    return Promise.all(
        labels.map(async label => {
            for(i=1; i<=2; i++){
                const img = await faceapi.fetchImage(`https://drive.google.com/drive/folders/14SxkhZhTQYbo1EmskmrfxfqKMQZazXT1${label}/${i}`)
                console.log(img)
            }
        })
    )
}

// video.addEventListener('play', ()=> {

//     const canvas = faceapi.createCanvasFromMedia(video);
//     document.body.append(canvas)
//     const canDisplaySize = {width: video.width, height: video.height}
//     faceapi.matchDimensions(canvas, canDisplaySize)
//     setInterval(async () => {
//         const detections =  await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
//         const resizedDetections = faceapi.resizeResults(detections, canDisplaySize);
//         canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height)
//         faceapi.draw.drawDetections(canvas, resizedDetections)
//         faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
//         faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
//         faceapi.draw.drawFaceRecognitions(canvas, resizedDetections)
//     }, 100);
// })