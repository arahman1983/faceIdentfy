const imageUpload = document.getElementById('imageUpload');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startRecognition)


async function startRecognition () {
    const container = document.createElement('div');
    container.style.position = 'relative';
    document.body.append(container)
    const labeledDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6)
    let imageLoaded;
    let canvas;
    imageUpload.addEventListener('change', async ()=>{
        imageLoaded && imageLoaded.remove()
        canvas && canvas.remove()
        imageLoaded = await faceapi.bufferToImage(imageUpload.files[0])
        imageLoaded.style.width = 500
        container.append(imageLoaded)

        canvas = faceapi.createCanvasFromMedia(imageLoaded)
        container.append(canvas)
        const canDisplaySize = {width: imageLoaded.width, height:imageLoaded.height}
        faceapi.matchDimensions(canvas, canDisplaySize)
        
        const detections = await faceapi.detectAllFaces(imageLoaded).withFaceLandmarks().withFaceDescriptors()

        const resizedDetections = faceapi.resizeResults(detections, canDisplaySize);
        
        const results = resizedDetections.map(resizedDetection => faceMatcher.findBestMatch(resizedDetection.descriptor) )

        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {label: result.toString()})
            drawBox.draw(canvas)

        })
    })
}

function loadLabeledImages () {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']

    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for(i=1; i<=2; i++){
                const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
            }

            return new faceapi.LabeledFaceDescriptors(label, descriptions)
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