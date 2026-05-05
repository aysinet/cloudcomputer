(function(Vue) {
  const { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } = Vue;

  /* ── I18N ── */
  const LANGS = {
    tr: {
      title:'CarPaper', vehicles:'Araçlar', addVehicle:'Araç Ekle', editVehicle:'Araç Düzenle',
      plate:'Plaka', brand:'Marka', model:'Model', year:'Yıl', color:'Renk', km:'Kilometre',
      fuelType:'Yakıt Tipi', engineSize:'Motor Hacmi (cc)',
      gasoline:'Benzin', diesel:'Dizel', lpg:'LPG', electric:'Elektrik', hybrid:'Hibrit',
      inspection:'Muayene', tax:'Vergi', fuel:'Yakıt', accident:'Kaza/Ceza',
      inspections:'Muayene Kayıtları', taxes:'Vergi Kayıtları', fuelLogs:'Yakıt Kayıtları', accidents:'Kaza/Ceza Kayıtları',
      addInspection:'Muayene Ekle', addTax:'Vergi Ekle', addFuel:'Yakıt Ekle', addAccident:'Kaza/Ceza Ekle',
      editRecord:'Kaydı Düzenle',
      date:'Tarih', nextDate:'Sonraki Tarih', amount:'Tutar', result:'Sonuç', station:'İstasyon',
      liters:'Litre', pricePerLiter:'Lt Fiyatı', totalKm:'Toplam Km', consumption:'Tüketim',
      type:'Tür', description:'Açıklama', notes:'Notlar', fineAmount:'Ceza Tutarı',
      passed:'Geçti', failed:'Kaldı',
      accidentType:'Kaza', fineType:'Ceza', otherType:'Diğer',
      save:'Kaydet', cancel:'İptal', delete:'Sil', edit:'Düzenle', close:'Kapat',
      exportBudget:'Bütçeye Aktar', setReminder:'Hatırlatıcı Kur', addCalendar:'Takvime Ekle',
      success:'Başarılı', error:'Hata', deleted:'Silindi', saved:'Kaydedildi',
      exportedBudget:'Bütçeye aktarıldı', reminderSet:'Hatırlatıcı kuruldu', calendarAdded:'Takvime eklendi',
      noVehicles:'Henüz araç eklenmedi', noRecords:'Kayıt bulunamadı',
      summary:'Özet', totalExpenses:'Toplam Harcama', avgConsumption:'Ort. Tüketim',
      nextInspection:'Sonraki Muayene', nextTax:'Sonraki Vergi',
      ltPer100km:'lt/100km', allVehicles:'Tüm Araçlar',
      confirmDelete:'Bu kaydı silmek istediğinize emin misiniz?',
      overdue:'Süresi geçmiş', upcoming:'Yaklaşan', daysLeft:'gün kaldı', daysAgo:'gün geçti',
      expenseChart:'Harcama Grafiği', fuelChart:'Yakıt Grafiği',
      monthlyExpenses:'Aylık Harcamalar', fuelHistory:'Yakıt Geçmişi',
      insurance:'Sigorta', addInsurance:'Sigorta Ekle', insurances:'Sigorta Kayıtları',
      provider:'Sigorta Şirketi', policyNo:'Poliçe No', expiryDate:'Bitiş Tarihi',
      kasko:'Kasko', traffic:'Trafik Sigortası', insuranceType:'Sigorta Türü'
    },
    en: {
      title:'CarPaper', vehicles:'Vehicles', addVehicle:'Add Vehicle', editVehicle:'Edit Vehicle',
      plate:'Plate', brand:'Brand', model:'Model', year:'Year', color:'Color', km:'Mileage',
      fuelType:'Fuel Type', engineSize:'Engine Size (cc)',
      gasoline:'Gasoline', diesel:'Diesel', lpg:'LPG', electric:'Electric', hybrid:'Hybrid',
      inspection:'Inspection', tax:'Tax', fuel:'Fuel', accident:'Accident/Fine',
      inspections:'Inspection Records', taxes:'Tax Records', fuelLogs:'Fuel Logs', accidents:'Accident/Fine Records',
      addInspection:'Add Inspection', addTax:'Add Tax', addFuel:'Add Fuel', addAccident:'Add Accident/Fine',
      editRecord:'Edit Record',
      date:'Date', nextDate:'Next Date', amount:'Amount', result:'Result', station:'Station',
      liters:'Liters', pricePerLiter:'Price/Lt', totalKm:'Total Km', consumption:'Consumption',
      type:'Type', description:'Description', notes:'Notes', fineAmount:'Fine Amount',
      passed:'Passed', failed:'Failed',
      accidentType:'Accident', fineType:'Fine', otherType:'Other',
      save:'Save', cancel:'Cancel', delete:'Delete', edit:'Edit', close:'Close',
      exportBudget:'Export to Budget', setReminder:'Set Reminder', addCalendar:'Add to Calendar',
      success:'Success', error:'Error', deleted:'Deleted', saved:'Saved',
      exportedBudget:'Exported to budget', reminderSet:'Reminder set', calendarAdded:'Added to calendar',
      noVehicles:'No vehicles yet', noRecords:'No records found',
      summary:'Summary', totalExpenses:'Total Expenses', avgConsumption:'Avg. Consumption',
      nextInspection:'Next Inspection', nextTax:'Next Tax',
      ltPer100km:'lt/100km', allVehicles:'All Vehicles',
      confirmDelete:'Are you sure you want to delete this record?',
      overdue:'Overdue', upcoming:'Upcoming', daysLeft:'days left', daysAgo:'days ago',
      expenseChart:'Expense Chart', fuelChart:'Fuel Chart',
      monthlyExpenses:'Monthly Expenses', fuelHistory:'Fuel History',
      insurance:'Insurance', addInsurance:'Add Insurance', insurances:'Insurance Records',
      provider:'Provider', policyNo:'Policy No', expiryDate:'Expiry Date',
      kasko:'Comprehensive', traffic:'Third Party', insuranceType:'Insurance Type'
    },
    de: {
      title:'CarPaper', vehicles:'Fahrzeuge', addVehicle:'Fahrzeug hinzufügen', editVehicle:'Fahrzeug bearbeiten',
      plate:'Kennzeichen', brand:'Marke', model:'Modell', year:'Jahr', color:'Farbe', km:'Kilometerstand',
      fuelType:'Kraftstofftyp', engineSize:'Hubraum (cc)',
      gasoline:'Benzin', diesel:'Diesel', lpg:'LPG', electric:'Elektrisch', hybrid:'Hybrid',
      inspection:'TÜV', tax:'Steuer', fuel:'Kraftstoff', accident:'Unfall/Bußgeld',
      inspections:'TÜV-Einträge', taxes:'Steuereinträge', fuelLogs:'Tankeinträge', accidents:'Unfall/Bußgeld-Einträge',
      addInspection:'TÜV hinzufügen', addTax:'Steuer hinzufügen', addFuel:'Tankfüllung hinzufügen', addAccident:'Unfall/Bußgeld hinzufügen',
      editRecord:'Eintrag bearbeiten',
      date:'Datum', nextDate:'Nächstes Datum', amount:'Betrag', result:'Ergebnis', station:'Tankstelle',
      liters:'Liter', pricePerLiter:'Preis/Lt', totalKm:'Gesamt Km', consumption:'Verbrauch',
      type:'Typ', description:'Beschreibung', notes:'Notizen', fineAmount:'Bußgeldbetrag',
      passed:'Bestanden', failed:'Nicht bestanden',
      accidentType:'Unfall', fineType:'Bußgeld', otherType:'Sonstiges',
      save:'Speichern', cancel:'Abbrechen', delete:'Löschen', edit:'Bearbeiten', close:'Schließen',
      exportBudget:'Zum Budget exportieren', setReminder:'Erinnerung setzen', addCalendar:'Zum Kalender hinzufügen',
      success:'Erfolgreich', error:'Fehler', deleted:'Gelöscht', saved:'Gespeichert',
      exportedBudget:'Zum Budget exportiert', reminderSet:'Erinnerung gesetzt', calendarAdded:'Zum Kalender hinzugefügt',
      noVehicles:'Noch keine Fahrzeuge', noRecords:'Keine Einträge gefunden',
      summary:'Zusammenfassung', totalExpenses:'Gesamtausgaben', avgConsumption:'Durchschn. Verbrauch',
      nextInspection:'Nächster TÜV', nextTax:'Nächste Steuer',
      ltPer100km:'lt/100km', allVehicles:'Alle Fahrzeuge',
      confirmDelete:'Möchten Sie diesen Eintrag wirklich löschen?',
      overdue:'Überfällig', upcoming:'Bevorstehend', daysLeft:'Tage übrig', daysAgo:'Tage her',
      expenseChart:'Ausgabendiagramm', fuelChart:'Kraftstoffdiagramm',
      monthlyExpenses:'Monatliche Ausgaben', fuelHistory:'Tankhistorie',
      insurance:'Versicherung', addInsurance:'Versicherung hinzufügen', insurances:'Versicherungseinträge',
      provider:'Anbieter', policyNo:'Policen-Nr.', expiryDate:'Ablaufdatum',
      kasko:'Vollkasko', traffic:'Haftpflicht', insuranceType:'Versicherungstyp'
    },
    fr: {
      title:'CarPaper', vehicles:'Véhicules', addVehicle:'Ajouter un véhicule', editVehicle:'Modifier le véhicule',
      plate:'Plaque', brand:'Marque', model:'Modèle', year:'Année', color:'Couleur', km:'Kilométrage',
      fuelType:'Type de carburant', engineSize:'Cylindrée (cc)',
      gasoline:'Essence', diesel:'Diesel', lpg:'GPL', electric:'Électrique', hybrid:'Hybride',
      inspection:'Contrôle technique', tax:'Taxe', fuel:'Carburant', accident:'Accident/Amende',
      inspections:'Contrôles techniques', taxes:'Taxes', fuelLogs:'Historique carburant', accidents:'Accidents/Amendes',
      addInspection:'Ajouter un contrôle', addTax:'Ajouter une taxe', addFuel:'Ajouter du carburant', addAccident:'Ajouter accident/amende',
      editRecord:'Modifier le dossier',
      date:'Date', nextDate:'Prochaine date', amount:'Montant', result:'Résultat', station:'Station',
      liters:'Litres', pricePerLiter:'Prix/Lt', totalKm:'Km total', consumption:'Consommation',
      type:'Type', description:'Description', notes:'Notes', fineAmount:'Montant de l\'amende',
      passed:'Réussi', failed:'Échoué',
      accidentType:'Accident', fineType:'Amende', otherType:'Autre',
      save:'Enregistrer', cancel:'Annuler', delete:'Supprimer', edit:'Modifier', close:'Fermer',
      exportBudget:'Exporter vers budget', setReminder:'Définir un rappel', addCalendar:'Ajouter au calendrier',
      success:'Succès', error:'Erreur', deleted:'Supprimé', saved:'Enregistré',
      exportedBudget:'Exporté vers le budget', reminderSet:'Rappel défini', calendarAdded:'Ajouté au calendrier',
      noVehicles:'Aucun véhicule', noRecords:'Aucun enregistrement trouvé',
      summary:'Résumé', totalExpenses:'Dépenses totales', avgConsumption:'Conso. moyenne',
      nextInspection:'Prochain contrôle', nextTax:'Prochaine taxe',
      ltPer100km:'lt/100km', allVehicles:'Tous les véhicules',
      confirmDelete:'Êtes-vous sûr de vouloir supprimer cet enregistrement ?',
      overdue:'En retard', upcoming:'À venir', daysLeft:'jours restants', daysAgo:'jours passés',
      expenseChart:'Graphique des dépenses', fuelChart:'Graphique carburant',
      monthlyExpenses:'Dépenses mensuelles', fuelHistory:'Historique carburant',
      insurance:'Assurance', addInsurance:'Ajouter une assurance', insurances:'Dossiers d\'assurance',
      provider:'Assureur', policyNo:'N° de police', expiryDate:'Date d\'expiration',
      kasko:'Tous risques', traffic:'Responsabilité civile', insuranceType:'Type d\'assurance'
    },
    es: {
      title:'CarPaper', vehicles:'Vehículos', addVehicle:'Agregar vehículo', editVehicle:'Editar vehículo',
      plate:'Matrícula', brand:'Marca', model:'Modelo', year:'Año', color:'Color', km:'Kilometraje',
      fuelType:'Tipo de combustible', engineSize:'Cilindrada (cc)',
      gasoline:'Gasolina', diesel:'Diésel', lpg:'GLP', electric:'Eléctrico', hybrid:'Híbrido',
      inspection:'Inspección', tax:'Impuesto', fuel:'Combustible', accident:'Accidente/Multa',
      inspections:'Registros de inspección', taxes:'Registros de impuestos', fuelLogs:'Registros de combustible', accidents:'Registros de accidentes/multas',
      addInspection:'Agregar inspección', addTax:'Agregar impuesto', addFuel:'Agregar combustible', addAccident:'Agregar accidente/multa',
      editRecord:'Editar registro',
      date:'Fecha', nextDate:'Próxima fecha', amount:'Monto', result:'Resultado', station:'Estación',
      liters:'Litros', pricePerLiter:'Precio/Lt', totalKm:'Km total', consumption:'Consumo',
      type:'Tipo', description:'Descripción', notes:'Notas', fineAmount:'Monto de multa',
      passed:'Aprobado', failed:'Rechazado',
      accidentType:'Accidente', fineType:'Multa', otherType:'Otro',
      save:'Guardar', cancel:'Cancelar', delete:'Eliminar', edit:'Editar', close:'Cerrar',
      exportBudget:'Exportar a presupuesto', setReminder:'Establecer recordatorio', addCalendar:'Agregar al calendario',
      success:'Éxito', error:'Error', deleted:'Eliminado', saved:'Guardado',
      exportedBudget:'Exportado al presupuesto', reminderSet:'Recordatorio establecido', calendarAdded:'Agregado al calendario',
      noVehicles:'Sin vehículos', noRecords:'No se encontraron registros',
      summary:'Resumen', totalExpenses:'Gastos totales', avgConsumption:'Consumo promedio',
      nextInspection:'Próxima inspección', nextTax:'Próximo impuesto',
      ltPer100km:'lt/100km', allVehicles:'Todos los vehículos',
      confirmDelete:'¿Está seguro de que desea eliminar este registro?',
      overdue:'Vencido', upcoming:'Próximo', daysLeft:'días restantes', daysAgo:'días atrás',
      expenseChart:'Gráfico de gastos', fuelChart:'Gráfico de combustible',
      monthlyExpenses:'Gastos mensuales', fuelHistory:'Historial de combustible',
      insurance:'Seguro', addInsurance:'Agregar seguro', insurances:'Registros de seguro',
      provider:'Aseguradora', policyNo:'N° de póliza', expiryDate:'Fecha de vencimiento',
      kasko:'Todo riesgo', traffic:'Responsabilidad civil', insuranceType:'Tipo de seguro'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
  function authHeaders() { return { 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || ''), 'Content-Type': 'application/json' }; }

  return {
    setup() {
      const locale = ref(getLocale());
      const L = (k) => (LANGS[locale.value] || LANGS.tr)[k] || (LANGS.en[k]) || k;
      function onLocaleChanged() { locale.value = getLocale(); }
      window.addEventListener('locale-changed', onLocaleChanged);
      onUnmounted(() => window.removeEventListener('locale-changed', onLocaleChanged));

      /* ── STATE ── */
      const vehicles = ref([]);
      const selectedVehicleId = ref(null);
      const activeTab = ref('summary'); // summary, inspection, tax, fuel, accident, insurance

      const inspections = ref([]);
      const taxes = ref([]);
      const fuelLogs = ref([]);
      const accidents = ref([]);
      const insurances = ref([]);

      // Dialogs
      const showVehicleDialog = ref(false);
      const showRecordDialog = ref(false);
      const editingVehicle = ref(null);
      const editingRecord = ref(null);
      const recordDialogType = ref('');

      const vehicleForm = reactive({ plate:'', brand:'', model:'', year: new Date().getFullYear(), color:'', km:0, fuel_type:'gasoline', engine_size:'' });
      const recordForm = reactive({ date:'', next_date:'', amount:0, result:'passed', station:'', liters:0, price_per_liter:0, total_km:0, type:'fine', description:'', notes:'', provider:'', policy_no:'', expiry_date:'', insurance_type:'kasko' });

      /* ── COMPUTED ── */
      const selectedVehicle = computed(() => vehicles.value.find(v => v.id === selectedVehicleId.value));

      const totalExpenses = computed(() => {
        const vid = selectedVehicleId.value;
        let total = 0;
        inspections.value.filter(r => !vid || r.vehicle_id === vid).forEach(r => total += (r.amount || 0));
        taxes.value.filter(r => !vid || r.vehicle_id === vid).forEach(r => total += (r.amount || 0));
        fuelLogs.value.filter(r => !vid || r.vehicle_id === vid).forEach(r => total += (r.amount || 0));
        accidents.value.filter(r => !vid || r.vehicle_id === vid).forEach(r => total += (r.amount || 0));
        insurances.value.filter(r => !vid || r.vehicle_id === vid).forEach(r => total += (r.amount || 0));
        return total;
      });

      const avgConsumption = computed(() => {
        const logs = fuelLogs.value.filter(r => (!selectedVehicleId.value || r.vehicle_id === selectedVehicleId.value) && r.liters > 0 && r.total_km > 0);
        if (logs.length < 2) return 0;
        const sorted = [...logs].sort((a,b) => a.total_km - b.total_km);
        const totalLiters = sorted.reduce((s,r) => s + r.liters, 0);
        const kmDiff = sorted[sorted.length-1].total_km - sorted[0].total_km;
        if (kmDiff <= 0) return 0;
        return ((totalLiters / kmDiff) * 100).toFixed(1);
      });

      const nextInspectionInfo = computed(() => {
        const recs = inspections.value.filter(r => (!selectedVehicleId.value || r.vehicle_id === selectedVehicleId.value) && r.next_date);
        if (!recs.length) return null;
        const sorted = recs.sort((a,b) => new Date(b.next_date) - new Date(a.next_date));
        const next = sorted[0];
        const diff = Math.ceil((new Date(next.next_date) - new Date()) / 86400000);
        return { date: next.next_date, days: diff, overdue: diff < 0 };
      });

      const nextTaxInfo = computed(() => {
        const recs = taxes.value.filter(r => (!selectedVehicleId.value || r.vehicle_id === selectedVehicleId.value) && r.next_date);
        if (!recs.length) return null;
        const sorted = recs.sort((a,b) => new Date(b.next_date) - new Date(a.next_date));
        const next = sorted[0];
        const diff = Math.ceil((new Date(next.next_date) - new Date()) / 86400000);
        return { date: next.next_date, days: diff, overdue: diff < 0 };
      });

      const nextInsuranceInfo = computed(() => {
        const recs = insurances.value.filter(r => (!selectedVehicleId.value || r.vehicle_id === selectedVehicleId.value) && r.expiry_date);
        if (!recs.length) return null;
        const sorted = recs.sort((a,b) => new Date(b.expiry_date) - new Date(a.expiry_date));
        const next = sorted[0];
        const diff = Math.ceil((new Date(next.expiry_date) - new Date()) / 86400000);
        return { date: next.expiry_date, days: diff, overdue: diff < 0 };
      });

      /* ── Monthly expense chart data ── */
      const monthlyChartData = computed(() => {
        const vid = selectedVehicleId.value;
        const months = {};
        const addToMonth = (records, key) => {
          records.filter(r => !vid || r.vehicle_id === vid).forEach(r => {
            const m = (r.date || '').slice(0, 7);
            if (!m) return;
            if (!months[m]) months[m] = { inspection:0, tax:0, fuel:0, accident:0, insurance:0 };
            months[m][key] += (r.amount || 0);
          });
        };
        addToMonth(inspections.value, 'inspection');
        addToMonth(taxes.value, 'tax');
        addToMonth(fuelLogs.value, 'fuel');
        addToMonth(accidents.value, 'accident');
        addToMonth(insurances.value, 'insurance');
        return Object.entries(months).sort((a,b) => a[0].localeCompare(b[0])).slice(-12);
      });

      const maxMonthlyTotal = computed(() => {
        let max = 0;
        monthlyChartData.value.forEach(([,d]) => {
          const sum = d.inspection + d.tax + d.fuel + d.accident + d.insurance;
          if (sum > max) max = sum;
        });
        return max || 1;
      });

      /* ── Fuel consumption chart data ── */
      const fuelChartData = computed(() => {
        const vid = selectedVehicleId.value;
        const logs = fuelLogs.value
          .filter(r => (!vid || r.vehicle_id === vid) && r.liters > 0 && r.total_km > 0)
          .sort((a,b) => a.total_km - b.total_km);
        const result = [];
        for (let i = 1; i < logs.length; i++) {
          const kmDiff = logs[i].total_km - logs[i-1].total_km;
          if (kmDiff > 0) {
            result.push({ date: logs[i].date, consumption: ((logs[i].liters / kmDiff) * 100).toFixed(1), km: logs[i].total_km });
          }
        }
        return result.slice(-20);
      });

      const maxConsumption = computed(() => {
        let max = 0;
        fuelChartData.value.forEach(d => { if (parseFloat(d.consumption) > max) max = parseFloat(d.consumption); });
        return max || 1;
      });

      /* ── API ── */
      async function api(method, path, body) {
        const opts = { method, headers: authHeaders() };
        if (body) opts.body = JSON.stringify(body);
        const r = await fetch('/api/carpaper' + path, opts);
        if (!r.ok) throw new Error('API error');
        return r.json();
      }

      async function loadVehicles() { vehicles.value = await api('GET', '/vehicles'); }
      async function loadInspections() { inspections.value = await api('GET', '/inspections' + (selectedVehicleId.value ? '?vehicle_id=' + selectedVehicleId.value : '')); }
      async function loadTaxes() { taxes.value = await api('GET', '/taxes' + (selectedVehicleId.value ? '?vehicle_id=' + selectedVehicleId.value : '')); }
      async function loadFuelLogs() { fuelLogs.value = await api('GET', '/fuellogs' + (selectedVehicleId.value ? '?vehicle_id=' + selectedVehicleId.value : '')); }
      async function loadAccidents() { accidents.value = await api('GET', '/accidents' + (selectedVehicleId.value ? '?vehicle_id=' + selectedVehicleId.value : '')); }
      async function loadInsurances() { insurances.value = await api('GET', '/insurances' + (selectedVehicleId.value ? '?vehicle_id=' + selectedVehicleId.value : '')); }

      async function loadAll() {
        await loadVehicles();
        await Promise.all([loadInspections(), loadTaxes(), loadFuelLogs(), loadAccidents(), loadInsurances()]);
      }

      /* ── VEHICLE CRUD ── */
      function openVehicleForm(v) {
        if (v) {
          editingVehicle.value = v.id;
          Object.assign(vehicleForm, { plate: v.plate, brand: v.brand, model: v.model, year: v.year, color: v.color, km: v.km, fuel_type: v.fuel_type, engine_size: v.engine_size });
        } else {
          editingVehicle.value = null;
          Object.assign(vehicleForm, { plate:'', brand:'', model:'', year: new Date().getFullYear(), color:'', km:0, fuel_type:'gasoline', engine_size:'' });
        }
        showVehicleDialog.value = true;
      }

      async function saveVehicle() {
        if (!vehicleForm.plate && !vehicleForm.brand) return;
        try {
          if (editingVehicle.value) {
            await api('PUT', '/vehicles/' + editingVehicle.value, vehicleForm);
          } else {
            await api('POST', '/vehicles', vehicleForm);
          }
          window.ElMessage.success(L('saved'));
          showVehicleDialog.value = false;
          await loadVehicles();
        } catch { window.ElMessage.error(L('error')); }
      }

      async function deleteVehicle(id) {
        try { await window.ElMessageBox.confirm(L('confirmDelete')); } catch { return; }
        try {
          await api('DELETE', '/vehicles/' + id);
          window.ElMessage.success(L('deleted'));
          if (selectedVehicleId.value === id) selectedVehicleId.value = null;
          await loadAll();
        } catch { window.ElMessage.error(L('error')); }
      }

      /* ── RECORD CRUD ── */
      function getEndpoint(type) {
        const map = { inspection:'/inspections', tax:'/taxes', fuel:'/fuellogs', accident:'/accidents', insurance:'/insurances' };
        return map[type] || '';
      }

      function openRecordForm(type, record) {
        recordDialogType.value = type;
        const today = new Date().toISOString().slice(0, 10);
        if (record) {
          editingRecord.value = record.id;
          Object.assign(recordForm, {
            date: record.date || today, next_date: record.next_date || '', amount: record.amount || 0,
            result: record.result || 'passed', station: record.station || '',
            liters: record.liters || 0, price_per_liter: record.price_per_liter || 0,
            total_km: record.total_km || 0, type: record.type || 'fine',
            description: record.description || '', notes: record.notes || '',
            provider: record.provider || '', policy_no: record.policy_no || '',
            expiry_date: record.expiry_date || '', insurance_type: record.insurance_type || 'kasko'
          });
        } else {
          editingRecord.value = null;
          Object.assign(recordForm, {
            date: today, next_date: '', amount: 0, result: 'passed', station: '',
            liters: 0, price_per_liter: 0, total_km: selectedVehicle.value?.km || 0,
            type: 'fine', description: '', notes: '',
            provider: '', policy_no: '', expiry_date: '', insurance_type: 'kasko'
          });
        }
        showRecordDialog.value = true;
      }

      function buildRecordBody() {
        const t = recordDialogType.value;
        const vid = selectedVehicleId.value || (vehicles.value[0]?.id);
        const base = { vehicle_id: vid, date: recordForm.date, amount: Number(recordForm.amount), notes: recordForm.notes };
        if (t === 'inspection') return { ...base, next_date: recordForm.next_date, result: recordForm.result };
        if (t === 'tax') return { ...base, next_date: recordForm.next_date, description: recordForm.description };
        if (t === 'fuel') return { ...base, station: recordForm.station, liters: Number(recordForm.liters), price_per_liter: Number(recordForm.price_per_liter), total_km: Number(recordForm.total_km) };
        if (t === 'accident') return { ...base, type: recordForm.type, description: recordForm.description };
        if (t === 'insurance') return { ...base, provider: recordForm.provider, policy_no: recordForm.policy_no, expiry_date: recordForm.expiry_date, insurance_type: recordForm.insurance_type };
        return base;
      }

      async function saveRecord() {
        const body = buildRecordBody();
        if (!body.vehicle_id) return window.ElMessage.error(L('error'));
        try {
          const ep = getEndpoint(recordDialogType.value);
          if (editingRecord.value) {
            await api('PUT', ep + '/' + editingRecord.value, body);
          } else {
            await api('POST', ep, body);
          }
          window.ElMessage.success(L('saved'));
          showRecordDialog.value = false;
          await loadAll();
        } catch { window.ElMessage.error(L('error')); }
      }

      async function deleteRecord(type, id) {
        try { await window.ElMessageBox.confirm(L('confirmDelete')); } catch { return; }
        try {
          await api('DELETE', getEndpoint(type) + '/' + id);
          window.ElMessage.success(L('deleted'));
          await loadAll();
        } catch { window.ElMessage.error(L('error')); }
      }

      /* ── INTEGRATIONS ── */
      async function exportToBudget(record, label) {
        const veh = vehicles.value.find(v => v.id === record.vehicle_id);
        const desc = (veh ? veh.plate + ' ' + veh.brand + ' ' + veh.model : '') + ' — ' + label;
        try {
          await fetch('/api/budget/entries', {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ type:'expense', amount: record.amount, category_id: null, description: desc.trim(), date: record.date, paid: true, recurring:'', notify: false, show_calendar: false })
          });
          window.ElMessage.success(L('exportedBudget'));
        } catch { window.ElMessage.error(L('error')); }
      }

      async function setReminder(title, date, repeat) {
        try {
          await fetch('/api/reminders', {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ title, note: '', datetime: date + 'T09:00', repeat: repeat || 'yearly', sound: true })
          });
          window.ElMessage.success(L('reminderSet'));
        } catch { window.ElMessage.error(L('error')); }
      }

      async function addToCalendar(title, date, color) {
        try {
          await fetch('/api/calendar', {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ date, title, color: color || '#3498db' })
          });
          window.ElMessage.success(L('calendarAdded'));
        } catch { window.ElMessage.error(L('error')); }
      }

      function setupInspectionReminder(record) {
        if (!record.next_date) return;
        const veh = vehicles.value.find(v => v.id === record.vehicle_id);
        const name = veh ? veh.plate : '';
        setReminder('🔧 ' + L('inspection') + ' — ' + name, record.next_date, 'yearly');
        addToCalendar('🔧 ' + L('inspection') + ' — ' + name, record.next_date, '#e74c3c');
      }

      function setupTaxReminder(record) {
        if (!record.next_date) return;
        const veh = vehicles.value.find(v => v.id === record.vehicle_id);
        const name = veh ? veh.plate : '';
        setReminder('💵 ' + L('tax') + ' — ' + name, record.next_date, 'yearly');
        addToCalendar('💵 ' + L('tax') + ' — ' + name, record.next_date, '#f39c12');
      }

      function setupInsuranceReminder(record) {
        if (!record.expiry_date) return;
        const veh = vehicles.value.find(v => v.id === record.vehicle_id);
        const name = veh ? veh.plate : '';
        setReminder('🛡️ ' + L('insurance') + ' — ' + name, record.expiry_date, 'yearly');
        addToCalendar('🛡️ ' + L('insurance') + ' — ' + name, record.expiry_date, '#9b59b6');
      }

      /* ── Helpers ── */
      function formatCurrency(val) { return Number(val || 0).toLocaleString(locale.value === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
      function formatDate(d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : undefined); } catch { return d; } }
      function getVehicleName(vid) { const v = vehicles.value.find(x => x.id === vid); return v ? (v.plate || v.brand + ' ' + v.model) : ''; }

      /* ── Watch & Init ── */
      watch(selectedVehicleId, () => { loadAll(); });

      onMounted(async () => { await loadAll(); if (vehicles.value.length && !selectedVehicleId.value) selectedVehicleId.value = vehicles.value[0].id; });

      return {
        L, locale, vehicles, selectedVehicleId, selectedVehicle, activeTab,
        inspections, taxes, fuelLogs, accidents, insurances,
        showVehicleDialog, showRecordDialog, editingVehicle, editingRecord, recordDialogType,
        vehicleForm, recordForm,
        totalExpenses, avgConsumption, nextInspectionInfo, nextTaxInfo, nextInsuranceInfo,
        monthlyChartData, maxMonthlyTotal, fuelChartData, maxConsumption,
        openVehicleForm, saveVehicle, deleteVehicle,
        openRecordForm, saveRecord, deleteRecord,
        exportToBudget, setupInspectionReminder, setupTaxReminder, setupInsuranceReminder,
        formatCurrency, formatDate, getVehicleName,
        loadAll
      };
    }
  };
})(Vue);
