var gm = require('gm')
var fs = require('fs')

console.log('Caleb is gonna transform your images')

function calibrateImg (img, size, calib, index) {
	var imgCalib = calib.computed_transforms[index]
	img
	.rotate('#000000', -imgCalib.angle)
	.gravity('Center')
	.scale((imgCalib.scale*100)+'%', (imgCalib.scale*100)+'%')
	.crop(imgCalib.cropWidth, imgCalib.cropHeight, -imgCalib.offsetX, -imgCalib.offsetY)
	.crop(calib.global_parameters.min_crop_width, calib.global_parameters.min_crop_height, 0, 0)
	.write('./aligned/aligned_'+index+'.jpg', function (err) {
	  if (err) {
	    console.log(err)
	    return
	  }
	  console.log('Done transforming img')
	})
}


// Get calibration data
var calibData = JSON.parse(fs.readFileSync('calibration_data.json', 'utf8'))
var imgPaths = fs.readdirSync('./source_img')

for (var i = 0; i < imgPaths.length; i++) {
	var img = gm('./source_img/'+imgPaths[i])
	var imgSize = img.size(function (err, value) {
		if (err) {
			console.log(err)
			return
		}
		calibrateImg(this.img, value, calibData, this.index)
	}.bind({img: img, index: i}))
}