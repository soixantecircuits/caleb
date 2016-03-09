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
  console.log('Pour index: ' + index + ', voici le truc: ', imgCalib)
  var imgName = (String(index).length < 2) ? '0'+ index : index

  im.convert([
    img.source,
    '-distort',
    'SRT', imgCalib.scale + ',' + -imgCalib.angle,
    '+repage', 
    path.join(pathDestinationDir,'aligned_' + imgName + '.jpg')
  ],
  function (err, stdout) {
    if (err) throw err
    var imgCalib = calib.computed_transforms[index]
    var imgName = (String(index).length < 2) ? '0'+ index : index
    var imgPath = path.join(pathDestinationDir,'aligned_' + imgName + '.jpg')

    gm(imgPath)
    .gravity('Center')
    .crop(imgCalib.cropWidth, imgCalib.cropHeight, -imgCalib.offsetX, -imgCalib.offsetY)
    .crop(calib.global_parameters.min_crop_width, calib.global_parameters.min_crop_height, 0, 0)
    .write(imgPath, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log('Done transforming img: ' + img.source)
      }
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
