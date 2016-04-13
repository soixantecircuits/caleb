var path = require('path')
var fs = require('fs-extra')
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

  var finalSize = {}
  finalSize.height = (calibData.global_parameters.min_crop_height % 2 === 0) ? calibData.global_parameters.min_crop_height : (calibData.global_parameters.min_crop_height + 1) 
  finalSize.width = (calibData.global_parameters.min_crop_width % 2 === 0) ? calibData.global_parameters.min_crop_width : (calibData.global_parameters.min_crop_width + 1) 
  var horCenterSecondCrop = (size.width - calibData.global_parameters.min_crop_width) / 2
  var vertCenterSecondCrop = (size.height - calibData.global_parameters.min_crop_height) / 2


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
    '-gravity', 'NorthWest',
    '-crop',
    finalSize.width + 'x' + finalSize.height + '+' + horCenterSecondCrop + '+' + vertCenterSecondCrop,
    '+repage', 
    path.join(pathDestinationDir,'aligned_' + imgName + '.jpg')
  ],
  function (err, stdout) {
    if (err) {
      throw err
    }
    console.log('Done transforming: ' + imgName)
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

for (var i = 0; i < imgPaths.length; i++) {
  im.identify(pathDir + '/' + imgPaths[i], function (err, features) {
    if (err) {
      throw err
    }
    calibrateImg(pathDir + '/' + imgPaths[this.i], features, calibData, this.i)
  }.bind({i: i}))
}