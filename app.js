var gm = require('gm')
var im = require('imagemagick')
var path = require('path')
var fs = require('fs-extra')
var pathDir = './source_img'
var pathDestinationDir = ('./aligned')
fs.ensureDirSync(pathDestinationDir)

console.log('Caleb is gonna transform your images')

function sign (x) {
  return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN
}

function calibrateImg(img, size, calib, index) {
  var imgCalib = calib.computed_transforms[index]
  var signedX = (sign(imgCalib.offsetX) > 0) ? '+' : ''
  var signedY = (sign(imgCalib.offsetY) > 0) ? '+' : ''
  console.log(imgCalib.cropWidth + 'x' + imgCalib.cropHeight + signedX + imgCalib.offsetX + signedY + imgCalib.offsetY)
  
  im.convert([
    img.source,
    '-distort',
    'SRT', imgCalib.scale + ',' + imgCalib.angle,
    '-crop',
    imgCalib.cropWidth + 'x' + imgCalib.cropHeight + signedX + imgCalib.offsetX + signedY + imgCalib.offsetY,
    '+repage',
    path.join(pathDestinationDir,'aligned_' + index + '.jpg')
  ],
    function (err, stdout) {
      if (err) throw err
      console.log('stdout:', stdout)
      console.log(calib.global_parameters.min_crop_width)
      console.log(calib.global_parameters.min_crop_height)
      gm(path.join(pathDestinationDir,'aligned_' + index + '.jpg'))
      .crop(calib.global_parameters.min_crop_width, calib.global_parameters.min_crop_height, 0, 0)
      .write(img.source, function (err) {
        if (err) {
          console.log(err)
        } else {
          console.log('Done transforming img: ' + img.source)
        }
      })
    })
}


// Get calibration data
var calibData = JSON.parse(fs.readFileSync('calibration_data.json', 'utf8'))
var imgPaths = fs.readdirSync(pathDir)

for (var i = 0; i < imgPaths.length; i++) {
  var img = gm(path.join(pathDir, imgPaths[i]))
  var imgSize = img.size(function (err, value) {
    if (err) {
      console.log(err)
      return
    }
    calibrateImg(this.img, value, calibData, this.index)
  }.bind({ img: img, index: i }))
}
