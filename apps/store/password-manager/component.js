(function(Vue) {
  const { ref, computed, onUnmounted } = Vue;

  const COLORS = ['#5c6bc0','#ef5350','#ab47bc','#26a69a','#ec407a','#7e57c2','#42a5f5','#ff7043','#66bb6a','#ffa726'];

  return {
    setup() {
      const unlocked = ref(false);
      const vaultExists = ref(false);
      const masterPass = ref('');
      const masterPassConfirm = ref('');
      const loading = ref(false);
      const lockError = ref('');
      let cachedMasterPass = '';

      const entries = ref([]);
      const groups = ref(['Genel', 'E-posta', 'Sosyal Medya', 'Banka', 'Sunucu']);
      const activeGroup = ref('');
      const search = ref('');
      const selectedId = ref(null);

      // Detail / Edit
      const showDetail = ref(false);
      const isEditing = ref(false);
      const detailEntry = ref(null);
      const editingEntry = ref({});
      const showPass = ref(false);

      // Group manager
      const showGroups = ref(false);
      const newGroupName = ref('');

      // Password generator
      const showGenOpts = ref(false);
      const genLength = ref(20);
      const genUpper = ref(true);
      const genLower = ref(true);
      const genDigits = ref(true);
      const genSymbols = ref(true);

      // Copy toast
      const copyToast = ref(false);
      let toastTimer = null;

      // Auto-lock timer
      let autoLockTimer = null;
      const AUTO_LOCK_MS = 5 * 60 * 1000; // 5 min

      function resetAutoLock() {
        if (autoLockTimer) clearTimeout(autoLockTimer);
        if (unlocked.value) {
          autoLockTimer = setTimeout(() => lockVault(), AUTO_LOCK_MS);
        }
      }

      const filteredEntries = computed(() => {
        let list = entries.value;
        if (activeGroup.value) list = list.filter(e => e.group === activeGroup.value);
        if (search.value) {
          const q = search.value.toLowerCase();
          list = list.filter(e =>
            (e.title || '').toLowerCase().includes(q) ||
            (e.username || '').toLowerCase().includes(q) ||
            (e.url || '').toLowerCase().includes(q)
          );
        }
        return list;
      });

      // Boot: check vault existence
      async function checkVault() {
        try {
          const res = await fetch('/api/vault/exists');
          if (res.ok) {
            const d = await res.json();
            vaultExists.value = d.exists;
          }
        } catch {}
      }
      checkVault();

      async function unlock() {
        lockError.value = '';
        if (!masterPass.value) { lockError.value = 'Şifre gerekli'; return; }
        if (!vaultExists.value) {
          if (masterPass.value.length < 6) { lockError.value = 'En az 6 karakter olmalı'; return; }
          if (masterPass.value !== masterPassConfirm.value) { lockError.value = 'Şifreler eşleşmiyor'; return; }
          // Create new vault
          loading.value = true;
          try {
            const res = await fetch('/api/vault/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ masterPassword: masterPass.value, entries: [], groups: groups.value })
            });
            if (res.ok) {
              cachedMasterPass = masterPass.value;
              vaultExists.value = true;
              unlocked.value = true;
              resetAutoLock();
            }
          } catch {}
          loading.value = false;
          return;
        }
        // Unlock existing
        loading.value = true;
        try {
          const res = await fetch('/api/vault/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ masterPassword: masterPass.value })
          });
          if (res.ok) {
            const data = await res.json();
            entries.value = data.entries || [];
            groups.value = data.groups || ['Genel'];
            cachedMasterPass = masterPass.value;
            unlocked.value = true;
            resetAutoLock();
          } else {
            const err = await res.json();
            lockError.value = err.error || 'Hata oluştu';
          }
        } catch { lockError.value = 'Bağlantı hatası'; }
        loading.value = false;
      }

      function lockVault() {
        unlocked.value = false;
        entries.value = [];
        cachedMasterPass = '';
        masterPass.value = '';
        masterPassConfirm.value = '';
        selectedId.value = null;
        showDetail.value = false;
        showPass.value = false;
        if (autoLockTimer) clearTimeout(autoLockTimer);
      }

      async function persistVault() {
        if (!cachedMasterPass) return;
        resetAutoLock();
        try {
          await fetch('/api/vault/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ masterPassword: cachedMasterPass, entries: entries.value, groups: groups.value })
          });
        } catch {}
      }

      function selectEntry(entry) {
        selectedId.value = entry.id;
        detailEntry.value = entry;
        showPass.value = false;
        isEditing.value = false;
        showDetail.value = true;
        resetAutoLock();
      }

      function openAdd() {
        editingEntry.value = {
          id: null,
          title: '',
          group: activeGroup.value || 'Genel',
          username: '',
          password: '',
          url: '',
          notes: '',
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        };
        isEditing.value = true;
        showGenOpts.value = false;
        showDetail.value = true;
        resetAutoLock();
      }

      function editEntry(entry) {
        editingEntry.value = { ...entry };
        isEditing.value = true;
        showGenOpts.value = false;
        resetAutoLock();
      }

      function saveEntry() {
        const e = editingEntry.value;
        if (!e.title) return;
        const now = new Date().toLocaleString('tr-TR');
        if (e.id) {
          const idx = entries.value.findIndex(x => x.id === e.id);
          if (idx >= 0) {
            entries.value[idx] = { ...e, modified: now };
            detailEntry.value = entries.value[idx];
          }
        } else {
          e.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
          e.created = now;
          e.modified = now;
          entries.value.push(e);
          detailEntry.value = e;
          selectedId.value = e.id;
        }
        isEditing.value = false;
        persistVault();
      }

      function deleteEntry(entry) {
        entries.value = entries.value.filter(e => e.id !== entry.id);
        showDetail.value = false;
        selectedId.value = null;
        detailEntry.value = null;
        persistVault();
      }

      function generatePassword() {
        showGenOpts.value = true;
        let chars = '';
        if (genUpper.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (genLower.value) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (genDigits.value) chars += '0123456789';
        if (genSymbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const arr = new Uint32Array(genLength.value);
        crypto.getRandomValues(arr);
        editingEntry.value.password = Array.from(arr, v => chars[v % chars.length]).join('');
      }

      function copyText(text) {
        navigator.clipboard.writeText(text);
        copyToast.value = true;
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { copyToast.value = false; }, 1500);
        resetAutoLock();
      }

      // Group management
      function openGroupManager() {
        showGroups.value = true;
        resetAutoLock();
      }

      function addGroup() {
        const name = newGroupName.value.trim();
        if (name && !groups.value.includes(name)) {
          groups.value.push(name);
          persistVault();
        }
        newGroupName.value = '';
      }

      function removeGroup(i) {
        const name = groups.value[i];
        groups.value.splice(i, 1);
        entries.value.forEach(e => { if (e.group === name) e.group = 'Genel'; });
        persistVault();
      }

      onUnmounted(() => {
        if (autoLockTimer) clearTimeout(autoLockTimer);
        if (toastTimer) clearTimeout(toastTimer);
      });

      return {
        unlocked, vaultExists, masterPass, masterPassConfirm, loading, lockError,
        entries, groups, activeGroup, search, selectedId,
        filteredEntries, showDetail, isEditing, detailEntry, editingEntry, showPass,
        showGroups, newGroupName, showGenOpts, genLength, genUpper, genLower, genDigits, genSymbols,
        copyToast,
        unlock, lockVault, selectEntry, openAdd, editEntry, saveEntry, deleteEntry,
        generatePassword, copyText, openGroupManager, addGroup, removeGroup
      };
    }
  };
})(Vue);
