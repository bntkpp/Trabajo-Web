// bitmask bipartite matching: left = bicolor levels (<=64), right = waste windows (bit positions < 64)
#include <stdint.h>
static int mt_nb; static uint64_t mt_adj[64]; static int mt_owner[64]; static uint64_t mt_vis;
static int mt_aug(int b){ uint64_t c=mt_adj[b]&~mt_vis; while(c){int w=__builtin_ctzll(c); c&=c-1; mt_vis|=1ULL<<w;
    if(mt_owner[w]<0||mt_aug(mt_owner[w])){mt_owner[w]=b;return 1;}} return 0;}
static int mt_max(void){ for(int i=0;i<64;i++)mt_owner[i]=-1; int r=0; for(int b=0;b<mt_nb;b++){mt_vis=0; r+=mt_aug(b);} return r;}
// Given S[0..T-1], y[0..T-1], offsets list, return deficiency = max(0, need - matching) ; also fills need
static int deficiency(int T,int L,const int*S,const int*y,const int*offs,int noff,int conv,int*needout,int*Iout,int*Wout){
  uint64_t lev[66]={0}; uint64_t col[66][2]; for(int h=0;h<=L;h++){col[h][0]=col[h][1]=0;}
  int mn=99,mx=-1; uint64_t full=(T>=64)?~0ULL:((1ULL<<T)-1);
  for(int i=0;i<T;i++){lev[S[i]]|=1ULL<<i; col[S[i]][y[i]]|=1ULL<<i; if(S[i]<mn)mn=S[i]; if(S[i]>mx)mx=S[i];}
  uint64_t waste=0; int W=0;
  for(int h=0;h<=L;h++) for(int c=0;c<2;c++){ uint64_t s=col[h][c]; if(!s)continue;
     if(conv==0) waste|= s & (s-1);            // all but first occurrence
     else { int hi=63-__builtin_clzll(s); waste|= s & ~(1ULL<<hi);} }
  W=__builtin_popcountll(waste);
  int I=0; mt_nb=0;
  for(int h=0;h<=L;h++) if(col[h][0]&&col[h][1]){ I++;
     uint64_t nb=0, s=lev[h];
     for(int k=0;k<noff;k++){ int o=offs[k]; nb|= (s<<o) | (s>>o); }
     mt_adj[mt_nb++]= nb & full & waste; }
  int delta=L-(mx-mn); int need=I-delta-1; *needout=need; *Iout=I; *Wout=W;
  if(need<=0) return 0;
  int r=mt_max(); return need>r? need-r:0;
}
