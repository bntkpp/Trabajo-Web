/* Fuerza bruta de referencia (Claude), sin poda: recorre x_0=0 (2^(6m) palabras) y anade el complemento
   (rho invariante por complemento, Lean xdel/rho_cx). Escribe todas las palabras con W<=m-1 y reporta min W. */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
int main(int argc,char**argv){ if(argc<3){fprintf(stderr,"uso: brute m salida.txt\n");return 2;}
  int m=atoi(argv[1]); int N=6*m+1,L=2*m+1,T=4*m+1; FILE*f=fopen(argv[2],"w"); if(!f) return 2; uint64_t mask=(N==64)?~0ULL:((1ULL<<N)-1);
  int minW=99; unsigned long long cnt=0;
  for(uint64_t v=0; v<(1ULL<<N); v+=2){ uint64_t seen[2]={0,0};
    for(int i=0;i<T;i++){ int s=__builtin_popcountll((v>>i)&((1ULL<<L)-1)); int y=(v>>(i+m))&1; seen[y]|=1ULL<<s; }
    int W=T-__builtin_popcountll(seen[0])-__builtin_popcountll(seen[1]); if(W<minW)minW=W;
    if(W<=m-1){ uint64_t c=(~v)&mask; for(int j=0;j<N;j++) fputc('0'+(int)((v>>j)&1),f); fputc('\n',f); for(int j=0;j<N;j++) fputc('0'+(int)((c>>j)&1),f); fputc('\n',f); cnt+=2; } }
  fclose(f); printf("BRUTE m=%d minW=%d palabras(W<=m-1, todas)=%llu\n",m,minW,cnt); return 0; }
