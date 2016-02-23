var gm = require('gm')
var fs = require('fs')

console.log('Caleb is gonna transform your images')

// Get calibration data
var calibData = JSON.parse(fs.readFileSync('calibration_data.json', 'utf8'))

function calibrateImg (img, size, calib) {
	var imgCalib = calib.computed_transforms[1]
	img
	.rotate('#000000', -imgCalib.angle)
	.gravity('Center')
	.scale(size.width * imgCalib.scale, size.height * imgCalib.scale)
	.crop(imgCalib.cropWidth, imgCalib.cropHeight, -imgCalib.offsetX, -imgCalib.offsetY)
	.crop(calib.global_parameters.min_crop_width, calib.global_parameters.min_crop_height, 0, 0)
	.write('./aligned/img_aligned2.jpg', function (err) {
	  if (err) {
	    console.log(err)
	    return
	  }
	  console.log('Done transforming img')
	})
}


var img = gm('./source_img/2.jpg')
var imgSize = img.size(function (err, value) {
	if (err) {
		console.log(err)
		return
	}
	calibrateImg(img, value, calibData)
})

