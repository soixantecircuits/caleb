var path = require('path')
var fs = require('fs-extra')
var Jimp = require('jimp')
var im = require('imagemagick')
var pathDir = './source_img'
var pathDestinationDir = ('./aligned')
fs.ensureDirSync(pathDestinationDir)

console.log('Caleb is gonna transform your images')

function calibrateImg(imgPath, size, calibData, index) {
  var imgCalib = calibData.computed_transforms[index]
  var imgName = (String(index).length < 2) ? '0'+ index : index

  var verticalGravity = (imgCalib.offsetY > 0 ) ? 'north' : 'south'
  var horizontalGravity = (imgCalib.offsetX > 0 ) ? 'west' : 'east'

  im.convert([
    imgPath,
    '-background', 'white',
    '-splice',  '0x' + Math.abs(imgCalib.offsetY),
    '-gravity', horizontalGravity,
    '-splice', Math.abs(imgCalib.offsetX) + 'x0',
    '-gravity', verticalGravity + horizontalGravity,
    '-crop',
    size.width + 'x' + size.height + '+0+0',

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

      var horCenterSecondCrop = (image.bitmap.width - calibData.global_parameters.min_crop_width) / 2
      var vertCenterSecondCrop = (image.bitmap.height - calibData.global_parameters.min_crop_height) / 2

      var finalSize = {}
      finalSize.height = (calibData.global_parameters.min_crop_height % 2 === 0) ? calibData.global_parameters.min_crop_height : (calibData.global_parameters.min_crop_height + 1) 
      finalSize.width = (calibData.global_parameters.min_crop_width % 2 === 0) ? calibData.global_parameters.min_crop_width : (calibData.global_parameters.min_crop_width + 1) 

      image
      .crop(horCenterSecondCrop, vertCenterSecondCrop, finalSize.width, finalSize.height)
      .quality(100)
      .write(imgPath, function (err) {
        if (err) {
          console.log(err)
          return
        }
        console.log('Done transforming: ' + imgName)
      })
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

var size = {
  height: 1280,
  width: 1920
}

for (var i = 0; i < imgPaths.length; i++) {
  calibrateImg(pathDir + '/' + imgPaths[i], size, calibData, i)
}