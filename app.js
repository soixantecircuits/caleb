var gm = require('gm')
var fs = require('fs')

console.log('Caleb is gonna transform your images')

// Get calibration data
var calib = JSON.parse(fs.readFileSync('calibration_data.json', 'utf8'))


var imgCalib = calib.computed_transforms[0]
console.log(imgCalib)
// GM transforms
gm('./source_img/1.jpg')
.rotate('#000000', -imgCalib.angle)
.crop(imgCalib.cropWidth, imgCalib.cropHeight, 148, 139)
// .crop(imgCalib.cropWidth, imgCalib.cropHeight, imgCalib.offsetX, imgCalib.Y)
.scale(calib.global_parameters.min_crop_width, calib.global_parameters.min_crop_height)
.write('./aligned/img_aligned.jpg', function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Done transforming img')
})