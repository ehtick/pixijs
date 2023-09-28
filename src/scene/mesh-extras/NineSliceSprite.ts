import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { Container } from '../container/Container';
import { definedProps } from '../container/utils/definedProps';
import { MeshView } from '../mesh/shared/MeshView';
import { NineSliceGeometry } from './NineSliceGeometry';

import type { ContainerOptions } from '../container/Container';

export interface NineSliceSpriteOptions extends ContainerOptions<MeshView<NineSliceGeometry>>
{
    texture: Texture;
    leftWidth?: number;
    topHeight?: number;
    rightWidth?: number;
    bottomHeight?: number;
}

/**
 * The NineSlicePlane allows you to stretch a texture using 9-slice scaling. The corners will remain unscaled (useful
 * for buttons with rounded corners for example) and the other areas will be scaled horizontally and or vertically
 *
 * <pre>
 *      A                          B
 *    +---+----------------------+---+
 *  C | 1 |          2           | 3 |
 *    +---+----------------------+---+
 *    |   |                      |   |
 *    | 4 |          5           | 6 |
 *    |   |                      |   |
 *    +---+----------------------+---+
 *  D | 7 |          8           | 9 |
 *    +---+----------------------+---+
 *  When changing this objects width and/or height:
 *     areas 1 3 7 and 9 will remain unscaled.
 *     areas 2 and 8 will be stretched horizontally
 *     areas 4 and 6 will be stretched vertically
 *     area 5 will be stretched both horizontally and vertically
 * </pre>
 * @example
 * import { NineSlicePlane, Texture } from 'pixi.js';
 *
 * const plane9 = new NineSlicePlane(Texture.from('BoxWithRoundedCorners.png'), 15, 15, 15, 15);
 */
export class NineSliceSprite extends Container<MeshView<NineSliceGeometry>>
{
    public static defaultOptions: NineSliceSpriteOptions = {
        texture: Texture.EMPTY,
        leftWidth: 10,
        topHeight: 10,
        rightWidth: 10,
        bottomHeight: 10,
    };

    /**
     * @param options - Options to use
     * @param options.texture - The texture to use on the NineSlicePlane.
     * @param options.leftWidth - Width of the left vertical bar (A)
     * @param options.topHeight - Height of the top horizontal bar (C)
     * @param options.rightWidth - Width of the right vertical bar (B)
     * @param options.bottomHeight - Height of the bottom horizontal bar (D)
     * @param options.width - Width of the NineSlicePlane,
     * setting this will actually modify the vertices and not the UV's of this plane.
     * @param options.height - Height of the NineSlicePlane,
     * setting this will actually modify the vertices and not UV's of this plane.
     */
    constructor(options: NineSliceSpriteOptions | Texture)
    {
        if ((options instanceof Texture))
        {
            options = { texture: options };
        }

        const { leftWidth, rightWidth, topHeight, bottomHeight, texture: optTex, ...rest } = options;
        const texture = optTex ?? NineSliceSprite.defaultOptions.texture;
        const borders = texture.layout.defaultBorders;

        const nineSliceGeometry = new NineSliceGeometry(definedProps({
            width: texture.width,
            height: texture.height,
            originalWidth: texture.width,
            originalHeight: texture.height,
            leftWidth: leftWidth ?? borders?.left ?? NineSliceSprite.defaultOptions.leftWidth,
            topHeight: topHeight ?? borders?.top ?? NineSliceSprite.defaultOptions.topHeight,
            rightWidth: rightWidth ?? borders?.right ?? NineSliceSprite.defaultOptions.rightWidth,
            bottomHeight: bottomHeight ?? borders?.bottom ?? NineSliceSprite.defaultOptions.bottomHeight,
            textureMatrix: texture.textureMatrix.mapCoord,
        }));

        super({
            view: new MeshView<NineSliceGeometry>(definedProps({
                geometry: nineSliceGeometry,
                texture,
            })),
            label: 'NineSliceSprite',
            ...rest
        });

        this.allowChildren = false;
    }

    // /** The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
    get width(): number
    {
        return this.view.geometry.width;
    }

    set width(value: number)
    {
        this.view.geometry.updatePositions({
            width: value,
        });
    }

    get height(): number
    {
        return this.view.geometry.height;
    }

    set height(value: number)
    {
        this.view.geometry.updatePositions({
            height: value,
        });
    }

    get leftWidth(): number
    {
        return this.view.geometry._leftWidth;
    }

    set leftWidth(value: number)
    {
        this.view.geometry.updateUvs({
            leftWidth: value,
        });
    }

    get topHeight(): number
    {
        return this.view.geometry._topHeight;
    }

    set topHeight(value: number)
    {
        this.view.geometry.updateUvs({
            topHeight: value,
        });
    }

    get rightWidth(): number
    {
        return this.view.geometry._rightWidth;
    }

    set rightWidth(value: number)
    {
        this.view.geometry.updateUvs({
            rightWidth: value,
        });
    }

    get bottomHeight(): number
    {
        return this.view.geometry._bottomHeight;
    }

    set bottomHeight(value: number)
    {
        this.view.geometry.updateUvs({
            bottomHeight: value,
        });
    }

    get texture(): Texture
    {
        return this.view.texture;
    }

    set texture(value: Texture)
    {
        if (value === this.view.texture) return;

        // // calculate the matrix..
        this.view.geometry.updateUvs({
            originalWidth: value.width,
            originalHeight: value.height,
            textureMatrix: value.textureMatrix.mapCoord,
        });

        this.view.texture = value;
    }
}

/** @deprecated since 8.0.0 */
export class NineSlicePlane extends NineSliceSprite
{
    constructor(options: NineSliceSpriteOptions | Texture);
    /** @deprecated since 8.0.0 */
    constructor(texture: Texture, leftWidth: number, topHeight: number, rightWidth: number, bottomHeight: number);
    constructor(...args: [NineSliceSpriteOptions | Texture] | [Texture, number, number, number, number])
    {
        let options = args[0];

        if (options instanceof Texture)
        {
            // eslint-disable-next-line max-len
            deprecation(v8_0_0, 'NineSlicePlane now uses the options object {texture, leftWidth, rightWidth, topHeight, bottomHeight}');

            options = {
                texture: options,
                leftWidth: args[1],
                topHeight: args[2],
                rightWidth: args[3],
                bottomHeight: args[4],
            };
        }
        deprecation(v8_0_0, 'NineSlicePlane is deprecated. Use NineSliceSprite instead.');
        super(options);
    }
}
