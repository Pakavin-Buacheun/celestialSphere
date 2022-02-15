let earth, galaxy, field
let observer, observer_

let cam
let controllable = true
let rw

let system = 1

let displayGrid = true,
    displayScales = false,
    displayLabels = true

let time = 0,
    speed = 1

let components = [ /*celestialPole, N, S, celestialEquator, ecliptic, equator, vernalEquinox, horizon*/ ]
let colors

let coordinates,
    Alpha_scales = [],
    Beta_scales = []

let RA = 0,
    Dec = 0,
    Az = 0,
    Alt = 0

let Alpha = 0,
    Beta = 0,
    playAlpha = false,
    playBeta = false,
    playBeta_dir = 1

let Alpha_re = /24|((2[0-3]|1?[0-9])(\.[0-9]{1,2})?)/,
    Beta_re = /-?(90|([1-8]?[0-9](\.[0-9]{1,2})?))/

let inputAlpha = document.getElementById('inputAlpha')
inputAlpha.addEventListener('input', () => {
    controllable = false
})
inputAlpha.addEventListener('change', () => {

    if (Alpha_re.test(inputAlpha.value)) {
        Alpha = float(inputAlpha.value.match(Alpha_re)[0])
        coordinates.label.clear()

        inputAlpha.value = nfc(Alpha, 2) + ((system === 1) ? 'h' : '°')
        if (system === 1) Alpha = map(Alpha, 0, 24, 0, 360)
    }
    controllable = true
})

let inputBeta = document.getElementById('inputBeta')
inputBeta.addEventListener('input', () => {
    controllable = false
})
inputBeta.addEventListener('change', () => {

    if (Beta_re.test(inputBeta.value)) {
        Beta = float(inputBeta.value.match(Beta_re)[0])
        coordinates.label.clear()

        inputBeta.value = ((system === 1 && Beta > 0) ? '+' : '') + nfc(Beta, 2) + '°'
    }
    controllable = true
})

let inputAlphaText = document.getElementById('inputAlphaText')
let inputBetaText = document.getElementById('inputBetaText')

let horizantal = document.getElementById('horizantal')
horizantal.addEventListener('click', () => {
    system = 0
    inputAlphaText.innerHTML = 'Azimuth: Az'
    inputBetaText.innerHTML = 'Altitude: Alt'
    Alpha_re = /360|(((3[0-5][0-9])|([1-2]?[0-9]{1,2}))(\.[0-9]{1,2})?)/
    Beta_re = /90|([1-8]?[0-9](\.[0-9]{1,2})?)/

    RA = Alpha
    Dec = Beta

    Alpha = Az
    Beta = Alt

    coordinates.label.clear()
    for (component of components) component.label.clear()

    inputAlpha.value = nfc(Alpha, 2) + '°'
    inputBeta.value = nfc(Beta, 2) + '°'
})

let equatorial = document.getElementById('equatorial')
equatorial.addEventListener('click', () => {
    system = 1
    inputAlphaText.innerHTML = 'Right Ascension: RA'
    inputBetaText.innerHTML = 'Declination: RA'
    Alpha_re = /24|((2[0-3]|1?[0-9])(\.[0-9]{1,2})?)/
    Beta_re = /-?(90|([1-8]?[0-9](\.[0-9]{1,2})?))/

    Az = Alpha
    Alt = Beta

    Alpha = RA
    Beta = Dec

    coordinates.label.clear()
    for (i = 0; i < 7; i++) {
        components[i].label.clear()
        components[i].label.fill(defaultColors[i])
    }

    inputAlpha.value = nfc(map(Alpha, 0, 360, 0, 24), 2) + 'h'
    inputBeta.value = ((Beta > 0) ? '+' : '') + nfc(Beta, 2) + '°'
})

function preload() {
    earth = loadImage('earth.jpg')
    galaxy = loadImage('galaxy.jpg')
    field = loadImage('field.jpg')

    observer_ = loadImage('observer_.png')
    observer = loadModel('observer.obj')
}

function setup() {
    pixelDensity(1.3)

    createCanvas(windowWidth, windowHeight, WEBGL)
    rw = min(width, height)

    defaultColors = [
        color(255),
        color(255, 0, 0),
        color(255, 0, 0),
        color(0, 255, 255),
        color(255, 255, 0),
        color(255, 0, 255),
        color(255),
        color(255, 255, 0),
    ]

    for (let i = 0; i < 8; i++) {
        if (i === 6) components[i] = new label(rw * 0.02)
        else components[i] = new label()
        components[i].label.fill(defaultColors[i])
    }

    coordinates = new label(rw * 0.02)
    coordinates.label.fill(0, 255, 0)

    for (let i = 0; i < 24; i++)
        Alpha_scales.push(new label(rw * 0.015))
    for (let i = -90; i <= 90; i += 15)
        Beta_scales.push(new label(rw * 0.015))

    cam = createCamera()
    cam.setPosition(cam.eyeX, cam.eyeY - rw * 0.1, cam.eyeZ)
    cam.lookAt(0, 0, 0)

    angleMode(DEGREES)
}

function draw() {
    background(0)

    if (controllable) orbitControl(1, 1, 0)
    ambientLight(100)

    push()

    //galaxy
    rotateY(time / 365)
    noStroke()
    texture(galaxy)
    sphere(max(width, height))
    pop()

    if (system === 0) {

        //hemisphere
        if (displayGrid) {
            noFill()
            stroke(255, 15)
            sphere(rw * 0.35)
        }

        //directions
        push()
        stroke(255, 0, 0)
        strokeWeight(rw / 400)

        line(-rw * 0.35, 0, rw * 0.35, 0)
        rotateY(90)
        line(-rw * 0.35, 0, rw * 0.35, 0)
        pop()

        push()

        noStroke()
        rotateX(90)

        push()
        strokeWeight(rw / 400)

        push()

        //horizantal plane
        translate(0, 0, -rw * 0.02)
        texture(field)

        //horizan
        stroke(255, 255, 0)
        circle(0, 0, rw * 0.7)
        pop()

        //directions
        push()
        ambientLight(255)
        fill(255, 0, 0)
        for (let i = 0; i < 4; i++) {
            push()
            rotateZ(90 * i)
            translate(rw * 0.35, 0, 0)
            triangle(0, 0, -rw * 0.05, rw * 0.01, -rw * 0.05, -rw * 0.01)
            pop()
        }
        pop()

        //coordinates
        if (playAlpha) {
            Alpha++
            Alpha %= 360
            coordinates.label.clear()
            inputAlpha.value = nfc(Alpha, 2) + '°'
        }
        if (playBeta) {
            Beta += playBeta_dir
            if (Beta > 90) playBeta_dir = -1
            else if (Beta < 0) playBeta_dir = 1
            coordinates.label.clear()
            inputBeta.value = nfc(Beta, 2) + '°'
        }
        push()
        rotateZ(Alpha)
        rotateY(-Beta)

        translate(rw * 0.35, 0, 0)
        ambientLight(255)
        fill(0, 255, 0)
        sphere(rw / 150)

        stroke(0, 255, 0)
        strokeWeight(rw / 400)
        line(0, 0, -rw * 0.35, 0)
        pop()

        ambientLight(255)

        //Azimuth
        fill(0, 255, 255, 50)
        if (Alpha != 360)
            arc(0, 0, rw * 0.7, rw * 0.7, 0, Alpha, PIE);

        //Altitude
        rotateZ(Alpha)
        rotateX(90)
        fill(255, 0, 0, 50)
        if (Beta > 0)
            arc(0, 0, rw * 0.7, rw * 0.7, 0, Beta, PIE);
        else if (Beta < 0)
            arc(0, 0, rw * 0.7, rw * 0.7, 360 + Beta, 360, PIE);
        pop()

        pop()

        if (displayScales) {
            //Azimuth scales
            for (i in Alpha_scales) {
                push()
                Alpha_scales[i].setCoords(90 - i * 15, 0, rw * 0.35, 0, 0)
                Alpha_scales[i].show(nfc(i * 15, 2) + '°', 0)
                pop()
            }

            //Altitude scales
            for (i = 1; i < Beta_scales.length / 2; i++) {
                push()
                Beta_scales[i].setCoords(90, 15 * i, rw * 0.35, rw * 0.02, 0)
                Beta_scales[i].show(nfc(15 * i, 2) + '°', 0)
                pop()
            }
        }

        if (displayLabels) {
            //component labels
            for (let i = 0; i < 4; i++) {
                push()
                components[i].label.fill(255)
                components[i].setCoords(-i * 90 + 90, 0, rw * 0.35 / 2, rw * 0.02, 0)
                components[i].show(['North', 'East', 'South', 'West'][i])
                pop()
            }

            push()
            components[4].label.fill(0, 255, 255)
            components[4].setCoords(0, 90, rw * 0.35, -rw * 0.02, 0)
            components[4].show('Zenith')
            pop()

            push()
            components[5].label.fill(255, 0, 255)
            components[5].setCoords(0, -90, rw * 0.35, rw * 0.02, 0)
            components[5].show('Nadir')
            pop()

            push()
            components[7].setCoords(45, 0, rw * 0.35, 0, 0)
            components[7].show('Horizan')
            pop()
        }

        //coordinates label
        push()
        coordinates.setCoords(-Alpha + 90, Beta, rw * 0.35, rw * 0.02, 0)
        coordinates.show(`(${nfc(Alpha, 2)}°, ${nfc(Beta, 2)}°)`, 0)
        pop()

        noStroke()

        //observer
        push()
        ambientLight(255)
        fill(255)
        sphere(rw / 200)
        pop()

        push()
        if(width >= height) directionalLight(color(255), -cos(time / 365), 0, -sin(time / 365))
        else ambientLight(140)
        rotateZ(180)
        translate(0, -rw * 0.02, 0)
        scale(rw / 900)

        texture(observer_)
        model(observer)
        pop()

    } else if (system === 1) {
        push()

        //celestial pole
        rotateY(-90)
        rotateX(23.5)
        push()
        strokeWeight(rw / 200)
        stroke(255, 0, 0)
        line(0, -rw * 0.35, 0, rw * 0.35)
        pop()

        //earth
        push()
        if(width >= height) directionalLight(color(255), -cos(time / 365), 0, -sin(time / 365))
        else ambientLight(140)
        rotateY(time)
        noStroke()
        texture(earth)
        sphere(rw * 0.1)
        pop()

        noFill()

        //celestial sphere
        if (displayGrid) {
            stroke(255, 15)
            sphere(rw * 0.35)
        }
        pop()

        push()

        //sun
        push()
        translate(rw * 0.35 * cos(time / 365), 0, rw * 0.35 * sin(time / 365))
        noStroke()
        ambientLight(255)
        fill(255, 255, 0)
        sphere(rw / 40)
        pop()

        strokeWeight(rw / 400)

        //ecliptic
        rotateX(90)
        noFill()
        stroke(255, 255, 0)
        circle(0, 0, rw * 0.7)

        //celestial equator
        rotateY(23.5)
        noFill()
        stroke(0, 255, 255)
        circle(0, 0, rw * 0.7)

        //equator
        stroke(255, 0, 255)
        circle(0, 0, rw * 0.201)

        //coordinates
        if (playAlpha) {
            Alpha++
            Alpha %= 360
            coordinates.label.clear()
            inputAlpha.value = nfc(map(Alpha, 0, 360, 0, 24), 2) + 'h'
        }
        if (playBeta) {
            Beta += playBeta_dir
            if (Beta > 90) playBeta_dir = -1
            else if (Beta < -90) playBeta_dir = 1
            coordinates.label.clear()
            inputBeta.value = (Beta > 0 ? '+' : '') + nfc(Beta, 2) + '°'
        }
        push()
        rotateZ(90 - Alpha)
        rotateY(-Beta)

        translate(rw * 0.35, 0, 0)
        ambientLight(255)
        noStroke()
        fill(0, 255, 0)
        sphere(rw / 150)

        stroke(0, 255, 0)
        line(0, 0, -rw * 0.35, 0)
        pop()

        noStroke()
        ambientLight(255)

        //Right Ascension
        rotateZ(90)
        fill(0, 255, 255, 50)
        if (Alpha != 360)
            arc(0, 0, rw * 0.7, rw * 0.7, -Alpha, 0, PIE);

        //Declination
        rotateZ(-Alpha)
        rotateX(90)
        fill(255, 0, 0, 50)
        if (Beta > 0)
            arc(0, 0, rw * 0.7, rw * 0.7, 0, Beta, PIE);
        else if (Beta < 0)
            arc(0, 0, rw * 0.7, rw * 0.7, 360 + Beta, 360, PIE);
        pop()

        //vernal equinox
        push()
        ambientLight(255)
        fill(255)
        noStroke()

        translate(0, 0, rw * 0.35)
        sphere(rw / 200)
        pop()

        if (displayLabels) {
            //component labels
            push()
            components[0].setCoords(-90, 50, rw * 0.35 / 2)
            components[0].show('Celestial Pole')
            pop()

            push()
            components[1].setCoords(0, 90, rw * 0.35, rw * 0.02)
            components[1].show('North Celestial Pole')
            pop()

            push()
            components[2].setCoords(0, -90, rw * 0.35, -rw * 0.02)
            components[2].show('South Celestial Pole')
            pop()

            push()
            components[3].setCoords(90, 0, rw * 0.35, rw * 0.02)
            components[3].show('Celestial Equator')
            pop()

            push()
            components[4].setCoords(-45, 0, rw * 0.35, rw * 0.02, 0)
            components[4].show('Ecliptic')
            pop()

            push()
            components[5].setCoords(90, 0, rw * 0.35 / 2)
            components[5].show('Equator')
            pop()

            push()
            components[6].setCoords(0, 0, rw * 0.35, rw * 0.02)
            components[6].show('Vernal Equinox', color(255, 0), rw * 0.02)
            pop()
        }

        //coordinates label
        push()
        coordinates.setCoords(Alpha, Beta, rw * 0.35, rw * 0.02)
        coordinates.show(`(${nfc(map(Alpha, 0, 360, 0, 24), 2)}h, ${(Beta > 0 ? '+' : '') + nfc(Beta, 2)}°)`, 0)
        pop()

        if (displayScales) {
            //Right Ascension scales
            for (i in Alpha_scales) {
                push()
                Alpha_scales[i].setCoords(map(i, 0, 24, 0, 360), 0, rw * 0.35, -rw * 0.02)
                Alpha_scales[i].show(nfc(i, 2) + 'h', 0)
                pop()
            }

            //Betalination scales
            for (i in Beta_scales) {
                if (i != round(Beta_scales.length / 2) - 1) {
                    push()
                    Beta_scales[i].setCoords(0, 15 * i - 90, rw * 0.35, -rw * 0.02)
                    Beta_scales[i].show((15 * i - 90 > 0 ? '+' : '') + nfc(15 * i - 90, 2) + '°', 0)
                    pop()
                }
            }
        }
    }

    time += speed
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    rw = min(width, height)
}

class label {
    constructor(s = rw * 0.03) {
        this.label = createGraphics(0, s)
        this.label.textSize(s)
        this.label.fill(255)
        this.label.noStroke()
        this.label.textAlign(CENTER, CENTER)
    }
    setCoords(theta, phi, len, gap = 0, tilt = 23.5) {
        rotateZ(tilt)
        rotateY(theta)
        rotateX(phi)
        translate(0, 0, len)

        rotateX(-phi)
        rotateY(-theta)
        rotateZ(-tilt)
        translate(0, -gap, 0)

        if (cam.eyeX >= 0) rotateY(90)
        else rotateY(-90)
        rotateY(-atan(cam.eyeZ / cam.eyeX))
        rotateX(-asin(cam.eyeY / rw))
    }
    show(text, bgcolor = color(255, 0)) {
        this.label.resizeCanvas(text.length * this.label.height / 2 * 1.05, this.label.height)
        this.label.background(bgcolor)
        ambientLight(255)
        noStroke()

        this.label.text(text, this.label.width / 2, this.label.height / 2)
        texture(this.label)
        plane(this.label.width, this.label.height)
    }
}