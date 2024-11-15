import { Repo } from '@automerge/automerge-repo';
import { applyMongoModifier, automergePatchesToMongoModifier, removeUndefined } from '../src/index';
import { Sakota } from '@creately/sakota';
import cloneDeep from 'lodash/cloneDeep';

describe('automergePatchesToMongoModifier function', () => {
    const repo = new Repo
    const doc = repo.create();
    doc.on("change", ( change: any )  => {
        it('should convert patches to mongo modifier', () => {
            const vale = automergePatchesToMongoModifier( change.patches as any );
            const proxied = Sakota.create({} as any);
            proxied.__sakota__.mergeChanges( vale );
            expect( proxied.__sakota__.unwrap() ).toEqual( change.doc );
        });
    });
    doc.change(( d: any ) => {
        d.test = { prop: [['el',[]],'el2']}
    });
    doc.change(( d: any ) => {
        d.test = {}
    });
    doc.change(( d: any ) => {
        delete d.test;
    });
    doc.change(( d: any ) => {
        Object.keys( d ).forEach( key => delete d[key] );
        d.name = 'test';
        d.collabs = ['c1', 'c2'],
        d.shapes = {
            s1: { type: 'rect', x: 10, y: 20, width: 100, height: 200 },
            s2: { type: 'circle', cx: 100, cy: 200, r: 50, ar: [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ]}
        },
        d.shapes.s1.width = 200;
        d.shapes.s2.r = 100;
        delete d.shapes.s1;
    });
    doc.change(( d: any ) => {
        Object.keys( d ).forEach( key => delete d[key] );
        d.arr = [ 3,4,5,4];
        d.arr.push(1);
    });
    doc.change(( d: any ) => {
        Object.keys( d ).forEach( key => delete d[key] );
        d.arr = [ 1, { arr2: [ {}, 3, 'adad' ] }, 3 ];
        d.arr[1].arr2.push( 4 );
        d.arr[1].arr2.splice( 1, 1, 2 );
        d.shapes = { s1: {}, s2: {} };
        d.shapes.s1.name = 'shape1';
        delete d.ss;
    });
});

describe('applyMongoModifier function', () => {
    const repo = new Repo();

    [
        {
            obj: { shapes: { s1: {} }},
            modifier: {
                $set: {
                    'shapes.s1.name': 'shape1',
                    'shapes.s1.title': 'title1',
                },
            },
        },
        {
            obj: {
                shapes: { s1: {}, s2: {} }
            },
            modifier: {
                $set: {
                    'shapes.s1.name': 'shape1',
                    'shapes.s1.title': 'title1',
                },
                $unset: {
                    'shapes.s2': true,
                },
            },
        },
        {
            obj: { shapes: { s1: {}, s2: {} }},
            modifier: {
                $set: {
                    'shapes.s1.arr': [ 1, { arr2: [ {}, 3, 'adad' ] }, 3 ],
                },
            },
        },
        {
            obj: { shapes: { s1: {}, s2: {} }},
            modifier: {
                $set: {
                    'shapes.s1': { name: undefined, some: 'value', undef: undefined },
                },
            },
        },
    ].forEach(({ obj, modifier }, i ) => {
        it('should apply mongo modifier to automerge doc' + i, async () => {
            const doc = repo.create( cloneDeep( obj ));
            doc.change(( d: any ) => {
                applyMongoModifier( d, modifier );
            });
            const _doc = await doc.doc()
            const proxied = Sakota.create( cloneDeep( obj ));
            proxied.__sakota__.mergeChanges( modifier );
            expect( proxied.__sakota__.unwrap() ).toEqual( _doc );
        });
    });

});

describe('removeUndefined function', () => {
    [
        {
            input: {
                a: 1,
                b: undefined,
                c: {
                  d: 2,
                  e: undefined,
                  f: {
                    g: 3,
                    h: undefined
                  }
                }
            },
            output: { a: 1, c: { d: 2, f: { g: 3 } } }
        },
        {
            input: {
                a: null,
                b: undefined,
                c: {
                  d: 0,
                  e: undefined,
                  f: {
                    g: 3,
                    h: undefined
                  }
                }
            },
            output: { a: null, c: { d: 0, f: { g: 3 } } }
        },
        {
            input: {},
            output: {},
        },
        {
            input: { prop: undefined },
            output: {},
        },
        {
            input: undefined,
            output: undefined,
        },
        {
            input: { d: { e: undefined }},
            output: { d: {} },
        }
    ].forEach(( obj, i ) => {
        it('should remove udefined properties ' + i, async () => {
            expect( removeUndefined( obj.input )).toEqual( obj.output );
        });
    });
})


