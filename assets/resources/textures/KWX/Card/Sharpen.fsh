varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform vec2 resolution;
uniform float value;

void main(void)
{
    if( texture2D(CC_Texture0, v_texCoord).a < 0.1 )
        discard;
    
    vec4 sample[5];
    vec2 unit = 1.0 / resolution.xy;
    vec2 tcOffset[5];
    tcOffset[0] = vec2(0.0, unit.y);
    tcOffset[1] = vec2(-unit.x, 0.0);
    tcOffset[2] = vec2(0.0, 0.0);
    tcOffset[3] = vec2(unit.x, 0.0);
    tcOffset[4] = vec2(0.0, -unit.y);
    
    sample[0] = texture2D(CC_Texture0, v_texCoord + tcOffset[0]);
    sample[1] = texture2D(CC_Texture0, v_texCoord + tcOffset[1]);
    sample[2] = texture2D(CC_Texture0, v_texCoord + tcOffset[2]);
    sample[3] = texture2D(CC_Texture0, v_texCoord + tcOffset[3]);
    sample[4] = texture2D(CC_Texture0, v_texCoord + tcOffset[4]);

    gl_FragColor = value * sample[2] - 0.3 * ( sample[0] + sample[1] + sample[3] + sample[4] );
}

//    vec2 tcOffset[25];
//    tcOffset[0] = vec2(-2.0*unit.x, 2.0*unit.y);
//    tcOffset[1] = vec2(-unit.x, 2.0*unit.y);
//    tcOffset[2] = vec2(0.0, 2.0*unit.y);
//    tcOffset[3] = vec2(unit.x, 2.0*unit.y);
//    tcOffset[4] = vec2(2.0*unit.x, 2.0*unit.y);
//    tcOffset[5] = vec2(-2.0*unit.x, unit.y);
//    tcOffset[6] = vec2(-unit.x, unit.y);
//    tcOffset[7] = vec2(0.0, unit.y);
//    tcOffset[8] = vec2(unit.x, unit.y);
//    tcOffset[9] = vec2(2.0*unit.x, unit.y);
//    tcOffset[10] = vec2(-2.0*unit.x, 0.0);
//    tcOffset[11] = vec2(-unit.x, 0.0);
//    tcOffset[12] = vec2(0.0, 0.0);
//    tcOffset[13] = vec2(unit.x, 0.0);
//    tcOffset[14] = vec2(2.0*unit.x, 0.0);
//    tcOffset[15] = vec2(-2.0*unit.x, -unit.y);
//    tcOffset[16] = vec2(-unit.x, -unit.y);
//    tcOffset[17] = vec2(0.0, -unit.y);
//    tcOffset[18] = vec2(unit.x, -unit.y);
//    tcOffset[19] = vec2(2.0*unit.x, -unit.y);
//    tcOffset[20] = vec2(-2.0*unit.x, -2.0*unit.y);
//    tcOffset[21] = vec2(-unit.x, -2.0*unit.y);
//    tcOffset[22] = vec2(0.0, -2.0*unit.y);
//    tcOffset[23] = vec2(unit.x, -2.0*unit.y);
//    tcOffset[24] = vec2(2.0*unit.x, -2.0*unit.y);
