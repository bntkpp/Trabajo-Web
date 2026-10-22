import sys
def analyze(xs, offs_spec):
    x=list(map(int,xs)); N=len(x); m=(N-1)//6; L=2*m+1; T=4*m+1
    S=[sum(x[i:i+L]) for i in range(T)]; y=[x[i+m] for i in range(T)]
    first={}; waste=[]
    for i in range(T):
        c=(S[i],y[i])
        if c in first: waste.append(i)
        else: first[c]=i
    rho=len(first); R=max(S)-min(S); d=L-R
    bic=[h for h in sorted(set(S)) if (h,0) in first and (h,1) in first]
    offs=[{'m':m,'m+1':m+1,'L':L}.get(o,None) or int(o) for o in offs_spec]
    adj={h:[w for w in waste if any(S[t]==h and abs(t-w) in offs for t in range(T))] for h in bic}
    # Kuhn matching, independent implementation
    own={}
    def tryk(h,seen):
        for w in adj[h]:
            if w in seen: continue
            seen.add(w)
            if w not in own or tryk(own[w],seen): own[w]=h; return True
        return False
    mt=sum(tryk(h,set()) for h in bic)
    need=len(bic)-d-1
    return dict(m=m,rho=rho,bound=3*m+2,W=T-rho,R=R,delta=d,I=len(bic),need=need,match=mt,deficit=max(0,need-mt),S=S)
if len(sys.argv)>=4 and sys.argv[1]=='--gate':
    # modo maquina: verify.py --gate RADIO PALABRA -> exit 0 solo si deficit>0 con |t-w|<=RADIO
    r=int(sys.argv[2]); res=analyze(sys.argv[3], [str(k) for k in range(r+1)]); res.pop('S')
    print('GATE radio=%d'%r, sys.argv[3], res, 'CONFIRMADO' if res['deficit']>0 else 'NO CONFIRMADO')
    sys.exit(0 if res['deficit']>0 else 1)
for line in sys.argv[2:]:
    r=analyze(line, sys.argv[1].split(','))
    S=r.pop('S'); print(line, r)
