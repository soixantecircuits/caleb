var gm = require('gm')
var fs = require('fs')

console.log('Caleb is gonna transform your images')

function calibrateImg (img, size, calib, index) {
	var imgCalib = calib.computed_transforms[index]
	var imgName = (String(index).length < 2) ? '0'+ index : index

	var finalCropSize = {height: 0, width: 0}
	finalCropSize.height = (calib.global_parameters.min_crop_height % 2 === 0 ) ? calib.global_parameters.min_crop_height : calib.global_parameters.min_crop_height - 1
	finalCropSize.width = (calib.global_parameters.min_crop_width % 2 === 0 ) ? calib.global_parameters.min_crop_width : calib.global_parameters.min_crop_width - 1

	// Transform image
	img
	.rotate('#000000', -imgCalib.angle)
	.gravity('Center')
	.scale((imgCalib.scale*100)+'%', (imgCalib.scale*100)+'%')
	.crop(imgCalib.cropWidth, imgCalib.cropHeight, -imgCalib.offsetX, -imgCalib.offsetY)
	.crop(finalCropSize.width, finalCropSize.height, 0, 0)
	.write('./aligned/aligned_'+imgName+'.jpg', function (err) {
	  if (err) {
	    console.log(err)
	    return
	  }
	  console.log('Done transforming img')
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
var imgPaths = fs.readdirSync('./source_img')
var alignedImgs = fs.readdirSync('./aligned')

// Remove presents aligned files to avoid bugs
for (var i = 0; i < alignedImgs.length; i++) {
	fs.unlinkSync('./aligned/'+alignedImgs[i])
}

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