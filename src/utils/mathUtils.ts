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

function IsPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

const Clamp = (number, min, max) => {
    return Math.min(Math.max(number, min), max);
};

const Dot2D = (vec1, vec2) => {
    return (vec2[0]*vec1[0] + vec2[1]*vec1[1]);
};

const Magnitude2D = (vec) => {
    return Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
};

const Magnitude3D = (vec) => {
    return Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2]);
};

const MagnitudeSquared2D = (vec) => {
    return vec[0]*vec[0] + vec[1]*vec[1];
};

const MagnitudeSquared3D = (vec) => {
    return vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2];
};

export {Interpolation, Clamp, Dot2D, Magnitude2D, Magnitude3D, MagnitudeSquared2D, MagnitudeSquared3D, IsPowerOf2};


