/* N0 — XDELX-V1: G5-EXTREME-DELETE exhaustivo sobre TODAS las palabras (x0=0; el complemento cubre el resto). Claude, 2026-10-22.
   p=min S, z=L-max S. Niveles bicolores ordenados h_1<...<h_I. Grafo G5: desperdicio fo, arista si |t-w|<=m+1.
   B_A = quitar p bajos y z+1 altos; B_B = quitar p+1 bajos y z altos. XDEL vale si B_A o B_B se cubre completo (vacio = cubierto).
   xdel_fail: ninguna de las dos se cubre. CTL (control negativo de la regla): quitar solo p bajos y z altos; debe fallar alguna vez.
   Uso: xdelx m shard nshards salida.txt     -DPLANT: usa el bloque del CTL en ambas orientaciones (debe producir xdel_fail>0). */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include "match.h"
static int cover_def(const uint64_t*adj,int lo,int hi){
  if(hi<=lo) return 0;
  mt_nb=0;
  for(int k=lo;k<hi;k++) mt_adj[mt_nb++]=adj[k];
  int r=mt_max();
  return (hi-lo)-r;
}
static void putw(FILE*f,const char*tag,uint64_t v,int N){ fprintf(f,"%s ",tag); for(int j=0;j<N;j++) fputc('0'+(int)((v>>j)&1),f); fputc('\n',f); }
int main(int argc,char**argv){
  if(argc<5){fprintf(stderr,"uso: xdelx m shard nshards salida\n");return 2;}
  int m=atoi(argv[1]),sh=atoi(argv[2]),ns=atoi(argv[3]); int N=6*m+1,L=2*m+1,T=4*m+1;
  if(m<1||N>63||ns<1||sh<0||sh>=ns){fprintf(stderr,"parametros\n");return 2;}
  uint64_t total=1ULL<<(N-1), lo=total/(uint64_t)ns*(uint64_t)sh, hi=(sh==ns-1)?total:total/(uint64_t)ns*(uint64_t)(sh+1);
  int offs[64]; for(int q=0;q<=m+1;q++) offs[q]=q;
  long long words=0,xf=0,cf=0,onlyA=0,onlyB=0,both=0,thm=0; uint64_t xw=0,cw=0; int hasx=0,hasc=0;
  for(uint64_t k=lo;k<hi;k++){
    uint64_t v=k<<1; int S[64],y[64]; int s=__builtin_popcountll(v&((1ULL<<L)-1));
    for(int i=0;i<T;i++){ if(i) s += (int)((v>>(i+2*m))&1) - (int)((v>>(i-1))&1); S[i]=s; y[i]=(int)((v>>(i+m))&1); }
    words++;
    int need,I,W; (void)deficiency(T,L,S,y,offs,m+2,0,&need,&I,&W);
    uint64_t adj[64]; for(int q=0;q<I;q++) adj[q]=mt_adj[q];
    int mn=99,mx=-1; for(int i=0;i<T;i++){ if(S[i]<mn)mn=S[i]; if(S[i]>mx)mx=S[i]; }
    int p=mn, z=L-mx; if(I>m+p+z) thm++;
#ifdef PLANT
    int okA=cover_def(adj,p,I-z)==0, okB=okA;
#else
    int okA=cover_def(adj,p,I-z-1)==0, okB=cover_def(adj,p+1,I-z)==0;
#endif
    if(!okA&&!okB){ xf++; if(!hasx){xw=v;hasx=1;} }
    else if(okA&&okB) both++; else if(okA) onlyA++; else onlyB++;
    if(cover_def(adj,p,I-z)>0){ cf++; if(!hasc){cw=v;hasc=1;} }
  }
  FILE*f=fopen(argv[4],"w"); if(!f) return 4;
  fprintf(f,"m %d\nshard %d/%d\nwords %lld\nxdel_fail %lld\nctl_fail %lld\nthm_viol %lld\nonly_A %lld\nonly_B %lld\nboth %lld\n",m,sh,ns,words,xf,cf,thm,onlyA,onlyB,both);
  if(hasx) putw(f,"xdel_witness",xw,N);
  if(hasc) putw(f,"ctl_witness",cw,N);
  fclose(f); return 0; }
