/**
 * Copyright @ 2017 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["esri/core/declare","esri/geometry/support/coordsUtils","esri/views/3d/support/PromiseLightweight","esri/views/3d/layers/graphics/Graphics3DSymbolCommonCode","esri/views/3d/layers/graphics/earcut/earcut","esri/views/3d/webgl-engine/lib/gl-matrix","../../support/geometryUtils"],function(t,e,n,i,r,s,p){var a=s.vec3d,o=a.create(),d=a.create(),h=a.create(),c=a.create(),u=a.create(),x=a.create(),l=a.create(),g=a.create(),v=6378137,m={Down:0,Up:1},f=Math.cos(5*(Math.PI/180)),y=100.11,_=t(n.Promise,{constructor:function(t,n,r){var s=t.geometry.rings;this.center=e.ringsCentroid([],s,!1),this._geometryData=i.copyPathData(s,t.geometry.hasZ),this._geometryData&&n>=0&&r>=0?(this.index=n,this.stride=r,this.resolve()):this.reject()},createBuffers:function(t,e){var n,s,a,o,d,h,c,u,x=this._geometryData.polygons,l=[],g=this._geometryData.vertexData;if(!g)return l;var v=g.length/3,f=new Float64Array(g.length);i.reproject(g,0,t,f,0,e,v);for(var _=new Float64Array(f),b=0;b<x.length;++b){n=x[b],c=n.count,u=n.index;var w=new Float64Array(g.buffer,3*u*g.BYTES_PER_ELEMENT,3*c);if(s=n.holeIndices.map(function(t){return t-u}),a=r(w,s,3),!(a.length<1)){var D={polygonIndex:b},E=new Float64Array(_.buffer,3*u*_.BYTES_PER_ELEMENT,3*c),F=this._computeNormalAndDistance(E);D.dist=F.distance;var U=p.getOrigin(f,v,u,c);if(U){D.origin=U;var z=[],A=[];o=n.count,d=2*o;for(var N=0;N<o;N++)h=N*this.stride,z[0+h]=w[0+3*N],z[1+h]=w[1+3*N],z[2+h]=1,z[3+h]=this.index,z[4+h]=m.Down,z[5+h]=this.center[0],z[6+h]=this.center[1],h=(N+o)*this.stride,z[0+h]=w[0+3*N],z[1+h]=w[1+3*N],z[2+h]=y,z[3+h]=this.index,z[4+h]=m.Up,z[5+h]=this.center[0],z[6+h]=this.center[1];for(var M=0,P=0,L=0;L<n.pathLengths.length;L++){P=n.pathLengths[L];for(var S=0;S<P;S++)S!==P-1?A.push(S+1+M,S+M,S+1+o+M,S+1+o+M,S+M,S+o+M):A.push(0+M,S+M,0+o+M,0+o+M,S+M,S+o+M);M+=P}this._subdivision2(w,E,a,o,z,A),D.indexNums=A.length,D.vertexNum=z.length/this.stride,D.vertices=new Float32Array(z),D.indices=new Uint32Array(A),l.push(D)}}}return l},_computeNormalAndDistance:function(t){var e=0,n=3,i=6;a.set3(t[e++],t[e++],t[e++],o),a.set3(t[n++],t[n++],t[n++],d),a.set3(t[i++],t[i++],t[i++],h),a.subtract(o,d,c),a.subtract(h,d,u);var r=a.create();a.cross(c,u,r),a.normalize(r,r);var s=Math.abs(a.dot(r,o)),p=v-s,x=a.normalize(o),l=a.dot(r,x),g=Math.abs(p/l);return{normal:r,distance:g}},_subdivision:function(t,e,n,i,r,s){for(var p,a,o,d,h,c,u,x,l=e.length/3,g=0,v=0,f=0;f<l;f++)d=e[g++],h=e[g++],c=e[g++],p=3*d,a=3*h,o=3*c,u=(t[p]+t[a]+t[o])/3,x=(t[p+1]+t[a+1]+t[o+1])/3,r.push(u,x,y,this.index,m.Up,this.center[0],this.center[1]),s.push(d+n,h+n,i+v),s.push(h+n,c+n,i+v),s.push(c+n,d+n,i+v),v++},_doSubdivision:function(t,e,n){if(t.length>0)for(var i,r,s,p,o,d,h,c,u,v,_=-1,b=e.length/this.stride;null!=(i=t.pop());)if(a.set(i.pt0,x),a.set(i.pt1,l),a.set(i.pt2,g),i.n0||(i.n0=a.create(),a.normalize(x,i.n0)),i.n1||(i.n1=a.create(),a.normalize(l,i.n1)),i.n2||(i.n2=a.create(),a.normalize(g,i.n2)),r=a.dot(i.n0,i.n1),s=a.dot(i.n1,i.n2),p=a.dot(i.n0,i.n2),r<f||s<f||p<f){if(o=Math.min(r,s,p),!isNaN(o)&&null!=o)if(o==r){_++,d=.5*(x[0]+l[0]),h=.5*(x[1]+l[1]),c=.5*(x[2]+l[2]),u=.5*(i.pt00[0]+i.pt11[0]),v=.5*(i.pt00[1]+i.pt11[1]);var w=a.createFrom(d,h,c);a.normalize(w),t.push({pt0:i.pt0,pt1:[d,h,c],pt2:i.pt2,pt00:i.pt00,pt11:[u,v],pt22:i.pt22,index0:i.index0,index1:b+_,index2:i.index2,n0:i.n0,n1:w,n2:i.n2}),t.push({pt0:[d,h,c],pt1:i.pt1,pt2:i.pt2,pt00:[u,v],pt11:i.pt11,pt22:i.pt22,index0:b+_,index1:i.index1,index2:i.index2,n0:w,n1:i.n1,n2:i.n2}),e.push(u,v,y,this.index,m.Up,this.center[0],this.center[1]),n.push(b+_,i.index0,i.index1)}else if(o==s){_++,d=.5*(l[0]+g[0]),h=.5*(l[1]+g[1]),c=.5*(l[2]+g[2]),u=.5*(i.pt22[0]+i.pt11[0]),v=.5*(i.pt22[1]+i.pt11[1]);var w=a.createFrom(d,h,c);a.normalize(w),t.push({pt0:i.pt0,pt1:i.pt1,pt2:[d,h,c],pt00:i.pt00,pt11:i.pt11,pt22:[u,v],index0:i.index0,index1:i.index1,index2:b+_,n0:i.n0,n1:i.n1,n2:w}),t.push({pt0:i.pt0,pt1:[d,h,c],pt2:i.pt2,pt00:i.pt00,pt11:[u,v],pt22:i.pt22,index0:i.index0,index1:b+_,index2:i.index2,n0:i.n0,n1:w,n2:i.n2}),e.push(u,v,y,this.index,m.Up,this.center[0],this.center[1]),n.push(b+_,i.index1,i.index2)}else if(o==p){_++,d=.5*(x[0]+g[0]),h=.5*(x[1]+g[1]),c=.5*(x[2]+g[2]),u=.5*(i.pt22[0]+i.pt00[0]),v=.5*(i.pt22[1]+i.pt00[1]);var w=a.createFrom(d,h,c);a.normalize(w),t.push({pt0:i.pt0,pt1:i.pt1,pt2:[d,h,c],pt00:i.pt00,pt11:i.pt11,pt22:[u,v],index0:i.index0,index1:i.index1,index2:b+_,n0:i.n0,n1:i.n1,n2:w}),t.push({pt0:[d,h,c],pt1:i.pt1,pt2:i.pt2,pt00:[u,v],pt11:i.pt11,pt22:i.pt22,index0:b+_,index1:i.index1,index2:i.index2,n0:w,n1:i.n1,n2:i.n2}),e.push(u,v,y,this.index,m.Up,this.center[0],this.center[1]),n.push(b+_,i.index2,i.index0)}}else n.push(i.index0,i.index1,i.index2)},_subdivision2:function(t,e,n,i,r,s){for(var p,a,o,d,h,c,u=n.length/3,x=0,l=0;l<u;l++)d=n[x++],h=n[x++],c=n[x++],p=3*d,a=3*h,o=3*c,this._doSubdivision([{pt0:[e[p],e[p+1],e[p+2]],pt1:[e[a],e[a+1],e[a+2]],pt2:[e[o],e[o+1],e[o+2]],pt00:[t[p],t[p+1]],pt11:[t[a],t[a+1]],pt22:[t[o],t[o+1]],index0:d+i,index1:h+i,index2:c+i}],r,s)},destroy:function(){this.isFulfilled()||this.reject()}});return _});