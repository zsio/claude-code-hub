import { useRef, useState } from "react";
import { toast } from "sonner";
import { editProvider } from "@/actions/providers";
import type { ProviderDisplay } from "@/types/provider";
import {
  clampWeight,
  clampIntInRange,
  clampTpm,
} from "@/lib/utils/validation";
import { PROVIDER_LIMITS } from "@/lib/constants/provider.constants";

export function useProviderEdit(item: ProviderDisplay, canEdit: boolean) {
  // 基本状态
  const [enabled, setEnabled] = useState<boolean>(item.isEnabled);
  const [togglePending, setTogglePending] = useState(false);

  // 权重编辑
  const [showWeight, setShowWeight] = useState(false);
  const [weight, setWeight] = useState<number>(clampWeight(item.weight));
  const initialWeightRef = useRef<number>(item.weight);

  // TPM 编辑
  const [showTpm, setShowTpm] = useState(false);
  const [tpmInfinite, setTpmInfinite] = useState<boolean>(item.tpm === null);
  const [tpmValue, setTpmValue] = useState<number>(() => {
    const base = item.tpm ?? PROVIDER_LIMITS.TPM.MIN;
    return clampTpm(base);
  });
  const initialTpmRef = useRef<number | null>(item.tpm);

  // RPM 编辑
  const [showRpm, setShowRpm] = useState(false);
  const [rpmInfinite, setRpmInfinite] = useState<boolean>(item.rpm === null);
  const [rpmValue, setRpmValue] = useState<number>(() =>
    clampIntInRange(item.rpm ?? PROVIDER_LIMITS.RPM.MIN, PROVIDER_LIMITS.RPM.MIN, PROVIDER_LIMITS.RPM.MAX)
  );
  const initialRpmRef = useRef<number | null>(item.rpm);

  // RPD 编辑
  const [showRpd, setShowRpd] = useState(false);
  const [rpdInfinite, setRpdInfinite] = useState<boolean>(item.rpd === null);
  const [rpdValue, setRpdValue] = useState<number>(() =>
    clampIntInRange(item.rpd ?? PROVIDER_LIMITS.RPD.MIN, PROVIDER_LIMITS.RPD.MIN, PROVIDER_LIMITS.RPD.MAX)
  );
  const initialRpdRef = useRef<number | null>(item.rpd);

  // CC 编辑
  const [showCc, setShowCc] = useState(false);
  const [ccInfinite, setCcInfinite] = useState<boolean>(item.cc === null);
  const [ccValue, setCcValue] = useState<number>(() =>
    clampIntInRange(item.cc ?? PROVIDER_LIMITS.CC.MIN, PROVIDER_LIMITS.CC.MIN, PROVIDER_LIMITS.CC.MAX)
  );
  const initialCcRef = useRef<number | null>(item.cc);

  // 切换启用状态
  const handleToggle = async (next: boolean) => {
    if (!canEdit || togglePending) return;
    setTogglePending(true);
    const prev = enabled;
    setEnabled(next);

    try {
      const res = await editProvider(item.id, { is_enabled: next });
      if (!res.ok) {
        throw new Error(res.error);
      }
    } catch (e) {
      console.error("切换服务商启用状态失败", e);
      setEnabled(prev);
      const msg = e instanceof Error ? e.message : '切换失败';
      toast.error(msg);
    } finally {
      setTogglePending(false);
    }
  };

  // 权重编辑处理
  const handleWeightPopover = (open: boolean) => {
    if (!canEdit) return;
    setShowWeight(open);
    if (open) {
      initialWeightRef.current = clampWeight(weight);
      return;
    }

    const next = clampWeight(weight);
    if (next !== clampWeight(initialWeightRef.current)) {
      editProvider(item.id, { weight: next }).then(res => {
        if (!res.ok) throw new Error(res.error);
      }).catch((e) => {
        console.error("更新权重失败", e);
        const msg = e instanceof Error ? e.message : '更新权重失败';
        toast.error(msg);
        setWeight(clampWeight(initialWeightRef.current));
      });
    }
  };

  // TPM 编辑处理
  const handleTpmPopover = (open: boolean) => {
    if (!canEdit) return;
    setShowTpm(open);
    if (open) {
      initialTpmRef.current = item.tpm;
      return;
    }

    const nextValue = tpmInfinite ? null : clampTpm(tpmValue);
    if (nextValue !== initialTpmRef.current) {
      editProvider(item.id, { tpm: nextValue }).then(res => {
        if (!res.ok) throw new Error(res.error);
      }).catch((e) => {
        console.error("更新TPM失败", e);
        const msg = e instanceof Error ? e.message : '更新TPM失败';
        toast.error(msg);
        setTpmInfinite(initialTpmRef.current === null);
        setTpmValue(clampTpm(initialTpmRef.current ?? PROVIDER_LIMITS.TPM.MIN));
      });
    }
  };

  // RPM 编辑处理
  const handleRpmPopover = (open: boolean) => {
    if (!canEdit) return;
    setShowRpm(open);
    if (open) {
      initialRpmRef.current = item.rpm;
      return;
    }

    const nextValue = rpmInfinite ? null : clampIntInRange(rpmValue, PROVIDER_LIMITS.RPM.MIN, PROVIDER_LIMITS.RPM.MAX);
    if (nextValue !== initialRpmRef.current) {
      editProvider(item.id, { rpm: nextValue }).then(res => {
        if (!res.ok) throw new Error(res.error);
      }).catch((e) => {
        console.error("更新RPM失败", e);
        const msg = e instanceof Error ? e.message : '更新RPM失败';
        toast.error(msg);
        setRpmInfinite(initialRpmRef.current === null);
        setRpmValue(clampIntInRange(initialRpmRef.current ?? PROVIDER_LIMITS.RPM.MIN, PROVIDER_LIMITS.RPM.MIN, PROVIDER_LIMITS.RPM.MAX));
      });
    }
  };

  // RPD 编辑处理
  const handleRpdPopover = (open: boolean) => {
    if (!canEdit) return;
    setShowRpd(open);
    if (open) {
      initialRpdRef.current = item.rpd;
      return;
    }

    const nextValue = rpdInfinite ? null : clampIntInRange(rpdValue, PROVIDER_LIMITS.RPD.MIN, PROVIDER_LIMITS.RPD.MAX);
    if (nextValue !== initialRpdRef.current) {
      editProvider(item.id, { rpd: nextValue }).then(res => {
        if (!res.ok) throw new Error(res.error);
      }).catch((e) => {
        console.error("更新RPD失败", e);
        const msg = e instanceof Error ? e.message : '更新RPD失败';
        toast.error(msg);
        setRpdInfinite(initialRpdRef.current === null);
        setRpdValue(clampIntInRange(initialRpdRef.current ?? PROVIDER_LIMITS.RPD.MIN, PROVIDER_LIMITS.RPD.MIN, PROVIDER_LIMITS.RPD.MAX));
      });
    }
  };

  // CC 编辑处理
  const handleCcPopover = (open: boolean) => {
    if (!canEdit) return;
    setShowCc(open);
    if (open) {
      initialCcRef.current = item.cc;
      return;
    }

    const nextValue = ccInfinite ? null : clampIntInRange(ccValue, PROVIDER_LIMITS.CC.MIN, PROVIDER_LIMITS.CC.MAX);
    if (nextValue !== initialCcRef.current) {
      editProvider(item.id, { cc: nextValue }).then(res => {
        if (!res.ok) throw new Error(res.error);
      }).catch((e) => {
        console.error("更新CC失败", e);
        const msg = e instanceof Error ? e.message : '更新CC失败';
        toast.error(msg);
        setCcInfinite(initialCcRef.current === null);
        setCcValue(clampIntInRange(initialCcRef.current ?? PROVIDER_LIMITS.CC.MIN, PROVIDER_LIMITS.CC.MIN, PROVIDER_LIMITS.CC.MAX));
      });
    }
  };

  return {
    // 状态
    enabled,
    togglePending,
    weight,
    setWeight,
    showWeight,
    tpmInfinite,
    setTpmInfinite,
    tpmValue,
    setTpmValue,
    showTpm,
    rpmInfinite,
    setRpmInfinite,
    rpmValue,
    setRpmValue,
    showRpm,
    rpdInfinite,
    setRpdInfinite,
    rpdValue,
    setRpdValue,
    showRpd,
    ccInfinite,
    setCcInfinite,
    ccValue,
    setCcValue,
    showCc,

    // 处理函数
    handleToggle,
    handleWeightPopover,
    handleTpmPopover,
    handleRpmPopover,
    handleRpdPopover,
    handleCcPopover,
  };
}