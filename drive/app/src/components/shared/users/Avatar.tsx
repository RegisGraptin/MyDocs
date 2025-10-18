import { getAddress, type Address } from "viem";
import { mainnet } from "viem/chains";
import { normalize, toCoinType } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";

const shortAddr = (a: string) => (a.length > 12 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a);

export function Avatar({ userAddress }: { userAddress: Address }) {
  const { data: ensName, isLoading } = useEnsName({
    address: getAddress(userAddress),
    coinType: toCoinType(mainnet.id),
    chainId: 1,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: 1,
    query: {
      enabled: !!ensName
    }
  });

  if (isLoading) return <div className="text-sm">Loading...</div>;

  return (
    <div className="flex items-center space-x-2 text-sm">
      {ensAvatar ? (
        <img
          src={ensAvatar}
          alt={ensName ?? shortAddr(userAddress)}
          className="w-5 h-5 rounded-full"
        />
      ) : (
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
          {shortAddr(userAddress).slice(0, 2)}
        </div>
      )}
      <span>{ensName ?? shortAddr(userAddress)}</span>
    </div>
  );
}
