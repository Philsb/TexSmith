const Interpolation = {
    SmoothStep: (a,b,alpha) => {
        //SmoothStep Interpolation
        return (b - a) * ((alpha * (alpha * 6.0 - 15.0) + 10.0) * alpha * alpha * alpha) + a;
    },
    Lerp: (a = 0, b = 1, alpha =  0.5) => {
        return a + (b - a) * alpha;
    },
    Circle: (a = 0,b = 1, alpha = 0.5) => {
        return a + (1 - Math.sqrt(1 - alpha**2))*(b - a);
    },
    CircleInverted: (a,b,alpha) => {
        return a + (Math.sqrt(1 - (alpha-1)**2))*(b - a);
    }



};

const InterpolationColor = {

    SmoothStep: (a,b,alpha) => {
        //SmoothStep Interpolation
        return (b - a) * ((alpha * (alpha * 6.0 - 15.0) + 10.0) * alpha * alpha * alpha) + a;
    }
}

const Clamp = (number, min, max) => {
    return Math.min(Math.max(number, min), max);
};


export {Interpolation, Clamp};


