/* N0 — LBENUM-V1. Enumerador exacto de puentes largos por estructura A U G V C (Claude, 2026-10-21).
   Genera toda palabra con un par (u,v), u<v, minimo S_u=p en u, maximo S_v=L-z en v, a=u, c=4m-v, a+c<=delta
   (puente largo, G4), y la acepta solo si (u,v) es un par min-max mas cercano global (verificado desde los bits).
   Cuenta pares (palabra, par) con minimo primero; el censo de todas las palabras da exactamente el doble.
   Uso: lb_enum m shard nshards salida.txt   -> lineas "dist delta b Wc We count" y resumen.
   Compilado con -DPLANT: falla plantada (suma 1 a Wc en la primera configuracion) para el control C2. */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
static long long dist[8][64][64][64];
static uint64_t nextcomb(uint64_t v){uint64_t t=v|(v-1);return (t+1)|(((~t&-~t)-1)>>(__builtin_ctzll(v)+1));}
int main(int argc,char**argv){
  if(argc<5){fprintf(stderr,"uso: lb_enum m shard nshards salida\n");return 2;}
  int m=atoi(argv[1]),shard=atoi(argv[2]),ns=atoi(argv[3]);
  int L=2*m+1,NW=4*m+1,n6=6*m+1; if(n6>63){fprintf(stderr,"m grande\n");return 2;}
  uint64_t maskL=(1ULL<<L)-1;
  long long pairs=0,v1=0,v2=0,eq=0,p4=0; int minWc=99,minWe_eq=99; long long cfg=0;
  for(int d=1;2*d<=m+1;d++)for(int p=0;p<=d;p++)for(int a=0;a<=d;a++)for(int c=0;a+c<=d;c++){
    if((cfg++)%ns!=shard)continue;
    int z=d-p,u=a,v=4*m-c,n=v-u,g=n-L,R=L-d,b=n-R; if(g<0)continue;
    uint64_t Uc0=p?((1ULL<<p)-1):0, Vz0=z?((1ULL<<z)-1):0;
    for(uint64_t Uo=Uc0; Uo<=maskL; Uo=(p?nextcomb(Uo):maskL+1)){      /* U: p unos (Gosper) */
     for(uint64_t Vzm=Vz0; Vzm<=maskL; Vzm=(z?nextcomb(Vzm):maskL+1)){  /* V: z ceros */
      uint64_t Vb=maskL&~Vzm;
      for(uint64_t Gb=0;Gb<(1ULL<<g);Gb++)for(uint64_t Ab=0;Ab<(1ULL<<a);Ab++)for(uint64_t Cb=0;Cb<(1ULL<<c);Cb++){
        uint64_t x=Ab|(Uo<<u)|(Gb<<(u+L))|(Vb<<v)|(Cb<<(v+L));
        int S[64],ok=1; uint64_t amin=0,amax=0;
        for(int i=0;i<NW;i++){int s=__builtin_popcountll((x>>i)&maskL);S[i]=s; if(s<p||s>L-z){ok=0;break;}
          if(s==p)amin|=1ULL<<i;
          if(s==L-z)amax|=1ULL<<i;}
        if(!ok)continue;
        int nn=1000; for(uint64_t A2=amin;A2;A2&=A2-1){int i=__builtin_ctzll(A2);for(uint64_t B2=amax;B2;B2&=B2-1){int j=__builtin_ctzll(B2);int dd=i>j?i-j:j-i;if(dd<nn)nn=dd;}}
        if(nn!=n)continue;                /* (u,v) no es par mas cercano */
        uint64_t cm[64],all=0,core=0,ext=0;
        for(int i=0;i<NW;i++){cm[i]=1ULL<<(2*S[i]+(int)((x>>(i+m))&1));all|=cm[i];}
        for(int i=u;i<=v;i++)core|=cm[i];
        for(int i=0;i<NW;i++)if(i<u||i>v)ext|=cm[i];
        int Wc=(n+1)-__builtin_popcountll(core), We=(4*m-n)-__builtin_popcountll(ext&~core);
        int Wt=NW-__builtin_popcountll(all);
#ifdef PLANT
        if(d==1&&p==0&&a==0&&c==0){Wc++;We--;}
#endif
        pairs++; if(Wt!=Wc+We)p4++;
        dist[d][b][Wc][We]++; if(Wc<minWc)minWc=Wc;
        if(Wc<m-2)v1++;
        if(Wc==m-2){eq++; if(We<minWe_eq)minWe_eq=We; if(We<1)v2++;}
      }
     }
    }
  }
  FILE*f=fopen(argv[4],"w"); if(!f)return 4;
  fprintf(f,"m %d\nshard %d/%d\npairs_minfirst %lld\nminWcore %d\nviol_P1 %lld\neq_Wcore_m2 %lld\nminWext_eq %d\nviol_P2 %lld\nP4_fail %lld\n",m,shard,ns,pairs,minWc,v1,eq,minWe_eq,v2,p4);
  for(int d=0;d<8;d++)for(int b=0;b<64;b++)for(int w=0;w<64;w++)for(int e=0;e<64;e++)if(dist[d][b][w][e])fprintf(f,"dist %d %d %d %d %lld\n",d,b,w,e,dist[d][b][w][e]);
  fclose(f); return 0;}
