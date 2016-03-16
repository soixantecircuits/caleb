var path = require('path')
var fs = require('fs-extra')
var Jimp = require('jimp')
var im = require('imagemagick')
var pathDir = './source_img'
var pathDestinationDir = ('./aligned')
fs.ensureDirSync(pathDestinationDir)

console.log('Caleb is gonna transform your images')

function calibrateImg(imgPath, calibData, index) {
  var imgCalib = calibData.computed_transforms[index]
  var imgName = (String(index).length < 2) ? '0'+ index : index

  im.convert([
    imgPath,
    '-distort',
    'SRT', imgCalib.scale + ',' + -imgCalib.angle,
    '+repage', 
    path.join(pathDestinationDir,'aligned_' + imgName + '.jpg')
  ],
  function (err, stdout) {
    var imgPath = path.join(pathDestinationDir,'aligned_' + imgName + '.jpg')

    Jimp.read(imgPath, function (err, image) {
      if (err) {
        throw err
      }

      var xPosFirstCrop = (image.bitmap.width - imgCalib.cropWidth - imgCalib.offsetX) / 2
      var yPosFirstCrop = ((image.bitmap.height - imgCalib.cropHeight) / 2) - imgCalib.offsetY

      var horCenterSecondCrop = Math.round((imgCalib.cropWidth - calibData.global_parameters.min_crop_width) / 2)
      var vertCenterSecondCrop = (imgCalib.cropHeight - calibData.global_parameters.min_crop_height) / 2

      image
      .crop( xPosFirstCrop, yPosFirstCrop, imgCalib.cropWidth, imgCalib.cropHeight)
      .crop(horCenterSecondCrop, vertCenterSecondCrop, calibData.global_parameters.min_crop_width, calibData.global_parameters.min_crop_height)
      .quality(100)
      .write(imgPath)
    })
  })
}


// Setup 
try {
  fs.mkdirSync('./aligned')
  console.log('Creating aligned folder')
} catch(e) {}
try {
  fs.mkdirSync('./source_img')
  console.log('Creating source_img folder')
} catch(e) {}

// Get calibration data
var calibData = JSON.parse(fs.readFileSync('calibration_data.json', 'utf8'))
var imgPaths = fs.readdirSync(pathDir)
var alignedImgs = fs.readdirSync('./aligned')

// Remove presents aligned files to avoid bugs
for (var i = 0; i < alignedImgs.length; i++) {
  fs.unlinkSync('./aligned/'+alignedImgs[i])
}

// for (var i = 0; i < imgPaths.length; i++) {
  // calibrateImg(pathDir + '/' + imgPaths[i], calibData, i)
// }

  calibrateImg(pathDir + '/' + imgPaths[28], calibData, 28)
  calibrateImg(pathDir + '/' + imgPaths[29], calibData, 29)