/* N0 censo exacto por poda (Claude). DEF-CORE directo: bits -> S_i (suma de ventana) -> y_i=x_{i+m} -> clases.
   Recorre TODAS las palabras de N=6m+1 bits (sin simetria). Cota inferior certificada W_lb(prefijo) =
   #ventanas completas cuya clase ya aparecio en una ventana completa anterior; es monotona en extensiones.
   Poda cuando W_lb >= m  (umbral conservador: conserva todas las palabras con W <= m-1, i.e. extremales y falsadores).
   Exhaustividad: suma de 2^(N-k) sobre ramas podadas + hojas evaluadas debe ser 2^N exactamente.
   Compilar con -DPLANT para la falla plantada: el criterio de falsador pasa a W < m (debe disparar en extremales). */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#ifdef PLANT
#define FALS(W) ((W) < m)
#else
#define FALS(W) ((W) < m-1)
#endif
static int m,N,L; static int x[128]; static uint64_t seen0,seen1;
static unsigned __int128 covered=0; static uint64_t nodes=0,leaves=0,pruned=0,nfals=0,next=0; static uint64_t prunedDepth[128];
static FILE *fext,*ffal,*fst;
static void leaf(int W){ leaves++; covered+=1;
  if(FALS(W)){ nfals++; for(int j=0;j<N;j++) fputc('0'+x[j],ffal); fprintf(ffal," W=%d\n",W); }
  else if(W==m-1){ next++; for(int j=0;j<N;j++) fputc('0'+x[j],fext); fputc('\n',fext); } }
static void rec(int k,int W,int s){ nodes++;
  if(k==N){ leaf(W); return; }
  for(int b=0;b<2;b++){ x[k]=b;
    if(k>=2*m){ int i=k-2*m; int S;
      if(i==0){ S=0; for(int j=0;j<L;j++) S+=x[j]; } else S=s+x[k]-x[i-1];
      int y=x[i+m]; uint64_t bit=1ULL<<S, s0=seen0, s1=seen1; int W2=W;
      if(y){ if(seen1&bit) W2++; else seen1|=bit; } else { if(seen0&bit) W2++; else seen0|=bit; }
      if(W2>=m){ pruned++; prunedDepth[k+1]++; covered += ((unsigned __int128)1)<<(N-(k+1)); }
      else rec(k+1,W2,S);
      seen0=s0; seen1=s1; }
    else rec(k+1,W,0); } }
int main(int argc,char**argv){
  if(argc<5){ fprintf(stderr,"uso: censo m extremales.txt falsadores.txt stats_holdout.txt\n"); return 2; }
  m=atoi(argv[1]); N=6*m+1; L=2*m+1; if(m<1||N>120){ fprintf(stderr,"m fuera de rango\n"); return 2; }
  fext=fopen(argv[2],"w"); ffal=fopen(argv[3],"w"); fst=fopen(argv[4],"w"); if(!fext||!ffal||!fst){ fprintf(stderr,"no se pueden abrir salidas\n"); return 2; }
  rec(0,0,0); fclose(fext); fclose(ffal);
  unsigned __int128 total=((unsigned __int128)1)<<N; int exh=(covered==total);
#ifdef PLANT
  printf("BUILD=PLANT ");
#else
  printf("BUILD=PRIMARIO ");
#endif
  printf("m=%d N=%d nodos=%llu podadas=%llu cobertura_ok=%d falsadores=%llu\n",
    m,N,(unsigned long long)nodes,(unsigned long long)pruned,exh,(unsigned long long)nfals);
  fprintf(fst,"m=%d hojas=%llu extremales(W=m-1)=%llu\n",m,(unsigned long long)leaves,(unsigned long long)next); fclose(fst);
  printf("podadas_por_profundidad:"); for(int k=0;k<=N;k++) if(prunedDepth[k]) printf(" %d:%llu",k,(unsigned long long)prunedDepth[k]); printf("\n");
  return exh?0:3; }
