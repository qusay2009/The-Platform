/**
 * The Platform – المنصة | Exhibition Booking System 2026
 * Brand-aligned booking system with identical slots for all 7 booths
 * SQL Database synchronization + Amman Timezone Recording
 */

const EXHIBITION_DATE = "12/12/2026";
const ADMIN_PASSWORD = "Qwaesrdtf2000";

const BOOTHS = [
  { id: "b1", name: "م. وسام مرعي",  icon: "👨‍💼", color: "#2980b9" },
  { id: "b2", name: "د. موسى صالح",  icon: "👨‍🏫", color: "#e67e22" },
  { id: "b3", name: "أ. خضر عباسي",  icon: "👨‍💻", color: "#c0392b" },
  { id: "b4", name: "أ. أحمد غباري",  icon: "👨‍💼", color: "#27ae60" },
  { id: "b5", name: "أ. وائل عياد",    icon: "👨‍💼", color: "#8e44ad" },
  { id: "b6", name: "أ. لجين سيوري",  icon: "👩‍💼", color: "#2980b9" },
  { id: "b7", name: "ASEZA",          icon: "🏛️",  color: "#e67e22" }
];

// Identical time slots for ALL booths – single universal break
const TIME_SLOTS = [
  { id: "s01", start: "10:30", end: "10:45", period: "صباحاً" },
  { id: "s02", start: "10:50", end: "11:05", period: "صباحاً" },
  { id: "s03", start: "11:10", end: "11:25", period: "صباحاً" },
  { id: "s04", start: "11:30", end: "11:45", period: "صباحاً" },
  { id: "s05", start: "11:50", end: "12:05", period: "صباحاً" },
  { id: "s06", start: "12:10", end: "12:25", period: "مساءً" },
  { id: "s07", start: "12:30", end: "12:45", period: "مساءً" },
  { id: "s08", start: "12:50", end: "1:05",  period: "مساءً" },
  { id: "s09", start: "1:10",  end: "1:25",  period: "مساءً" },
  // Single universal break
  { id: "brk", isBreak: true, label: "☕ استراحة موحدة للجميع من 1:25 إلى 1:40 ظهرًا" },
  { id: "s10", start: "1:40",  end: "1:55",  period: "مساءً" },
  { id: "s11", start: "2:00",  end: "2:15",  period: "مساءً" },
  { id: "s12", start: "2:20",  end: "2:35",  period: "مساءً" },
  { id: "s13", start: "2:40",  end: "2:55",  period: "مساءً" },
  { id: "s14", start: "3:00",  end: "3:15",  period: "مساءً" },
  { id: "s15", start: "3:20",  end: "3:35",  period: "مساءً" },
  { id: "s16", start: "3:40",  end: "3:55",  period: "مساءً" },
  { id: "s17", start: "4:00",  end: "4:15",  period: "مساءً" },
  { id: "s18", start: "4:20",  end: "4:35",  period: "مساءً" },
  { id: "s19", start: "4:40",  end: "4:55",  period: "مساءً" },
  { id: "s20", start: "5:00",  end: "5:15",  period: "مساءً" }
];

const TOTAL_BOOKABLE = TIME_SLOTS.filter(s => !s.isBreak).length;

// Storage
const DB_KEY = "exhibition_bookings_2026";
let bookings = [];

const DB = {
  load() { try { bookings = JSON.parse(localStorage.getItem(DB_KEY)) || []; } catch { bookings = []; } },
  save() { try { localStorage.setItem(DB_KEY, JSON.stringify(bookings)); } catch(e) { console.error(e); } },
  add(b) { bookings.push(b); this.save(); },
  remove(id) { bookings = bookings.filter(b => b.id !== id); this.save(); },
  reset() { bookings = []; this.save(); }
};

// December 2026 Calendar HTML
function decCalendarHTML() {
  const offset = 3; // Dec 1 2026 is Tuesday (Sat=0)
  let wk = '<div class="cal-weekdays"><span>سبت</span><span>أحد</span><span>اثن</span><span>ثلا</span><span>أربع</span><span>خمس</span><span>جمع</span></div>';
  let g = '<div class="cal-grid">';
  for (let i = 0; i < offset; i++) g += '<span class="cal-cell empty"></span>';
  for (let d = 1; d <= 31; d++) g += `<span class="cal-cell ${d===12?'today':''}">${d}</span>`;
  g += '</div>';
  return `
    <div class="cal-top">
      <div class="cal-date-badge"><span>📅</span> 12/12/2026</div>
    </div>
    <div class="cal-month-row"><span>ديسمبر</span><span>2026</span></div>
    ${wk}${g}
    <div class="cal-footnote">
      <img src="logo.jpg" alt="">
      <span>🔵 السبت 12 ديسمبر 2026</span>
    </div>`;
}

// Active Mobile Selected Consultant
let activeMobileBoothId = BOOTHS[0].id;

// Render for Desktop View
function renderDesktopBooths() {
  const c = document.getElementById("desktopBoothsSection");
  if (!c) return;
  c.innerHTML = "";
  buildTabs();

  BOOTHS.forEach(booth => {
    const bb = bookings.filter(b => b.boothId === booth.id);
    const avail = TOTAL_BOOKABLE - bb.length;

    let slotsHTML = '';
    TIME_SLOTS.forEach(slot => {
      if (slot.isBreak) {
        slotsHTML += `<div class="break-banner">${slot.label}</div>`;
        return;
      }
      const taken = bb.some(b => b.slotId === slot.id);
      if (taken) {
        slotsHTML += `
          <div class="slot-btn booked">
            <span class="slot-from-to">من ${slot.start} إلى ${slot.end}</span>
            <span class="slot-tag-sub">${slot.period} (محجوز)</span>
          </div>`;
      } else {
        slotsHTML += `
          <button class="slot-btn" onclick="openBooking('${booth.id}','${slot.id}')">
            <span class="slot-from-to">من ${slot.start} إلى ${slot.end}</span>
            <span class="slot-tag-sub">${slot.period}</span>
          </button>`;
      }
    });

    const card = document.createElement("div");
    card.className = "booth-card";
    card.id = `card-${booth.id}`;
    card.innerHTML = `
      <div class="booth-banner">
        <div class="booth-id-row">
          <div class="booth-avatar" style="background:${booth.color}15;border-color:${booth.color}50;color:${booth.color}">${booth.icon}</div>
          <div class="booth-name-col">
            <h2>${booth.name}</h2>
            <span class="booth-sub">12/12/2026 – 15 دقيقة لكل موعد</span>
          </div>
        </div>
        <div class="booth-avail-pill" style="color:${booth.color};border-color:${booth.color}50;background:${booth.color}10">${avail} موعد متاح</div>
      </div>
      <div class="booth-widget">
        <div class="cal-side">${decCalendarHTML()}</div>
        <div class="slots-side">
          <div class="slots-top-row">
            <span class="slots-day-title">السبت, ديسمبر 12</span>
            <span class="tz-pill">🕐 Asia/Amman</span>
          </div>
          <div class="slots-scroll"><div class="slots-grid">${slotsHTML}</div></div>
          <div class="slots-tz-footer">مدة الموعد: 15 دقيقة | فاصل: 5 دقائق</div>
        </div>
      </div>`;
    c.appendChild(card);
  });
}

// Render dedicated Native-App style Mobile Experience
function renderMobileBooths() {
  const container = document.getElementById("mobileBoothsSection");
  if (!container) return;

  const currentBooth = BOOTHS.find(b => b.id === activeMobileBoothId) || BOOTHS[0];
  const currentIdx = BOOTHS.findIndex(b => b.id === currentBooth.id);
  const prevBooth = BOOTHS[(currentIdx - 1 + BOOTHS.length) % BOOTHS.length];
  const nextBooth = BOOTHS[(currentIdx + 1) % BOOTHS.length];

  const currentBookings = bookings.filter(b => b.boothId === currentBooth.id);
  const currentAvail = TOTAL_BOOKABLE - currentBookings.length;

  // 1. Stories Carousel / Avatar Track
  let avatarBarHTML = '<div class="mobile-consultant-track">';
  BOOTHS.forEach(b => {
    const isAct = b.id === activeMobileBoothId;
    const bBookings = bookings.filter(bk => bk.boothId === b.id);
    const bAvail = TOTAL_BOOKABLE - bBookings.length;
    avatarBarHTML += `
      <div class="mobile-consultant-pill ${isAct ? 'active' : ''}" onclick="switchMobileConsultant('${b.id}')">
        <div class="m-avatar-circle" style="background:${b.color}18;border-color:${isAct ? b.color : '#e2e8f0'};color:${b.color}">
          <span>${b.icon}</span>
          ${isAct ? '<span class="m-check-badge">✓</span>' : ''}
        </div>
        <span class="m-consultant-name">${b.name}</span>
        <span class="m-consultant-count">${bAvail} متاح</span>
      </div>
    `;
  });
  avatarBarHTML += '</div>';

  // 2. Separate into Morning (10:30-1:25) and Evening (1:40-5:15)
  const morningSlots = TIME_SLOTS.filter(s => !s.isBreak && s.period === "صباحاً");
  const eveningSlots = TIME_SLOTS.filter(s => !s.isBreak && s.period === "مساءً");

  function renderMobileSlotCards(slotsList) {
    let out = '<div class="m-slots-grid">';
    slotsList.forEach(slot => {
      const taken = currentBookings.some(b => b.slotId === slot.id);
      if (taken) {
        out += `
          <div class="m-slot-card booked">
            <span class="m-slot-time">${slot.start}</span>
            <span class="m-slot-sub">من ${slot.start} إلى ${slot.end}</span>
            <span class="m-slot-badge booked-badge">محجوز ✕</span>
          </div>
        `;
      } else {
        out += `
          <button type="button" class="m-slot-card" onclick="openBooking('${currentBooth.id}','${slot.id}')">
            <span class="m-slot-time">${slot.start}</span>
            <span class="m-slot-sub">من ${slot.start} إلى ${slot.end}</span>
            <span class="m-slot-badge avail-badge">متاح للحجز 🟢</span>
          </button>
        `;
      }
    });
    out += '</div>';
    return out;
  }

  // 3. Assemble Mobile View HTML
  container.innerHTML = `
    <!-- Mobile App Section Label -->
    <div class="mobile-app-header">
      <div class="m-app-label">
        <span class="m-pulse-dot"></span>
        <span>اختر المستشار لتصفح مواعيده:</span>
      </div>
    </div>

    <!-- Horizontal Stories Track -->
    ${avatarBarHTML}

    <!-- Spotlight Card for Active Consultant -->
    <div class="mobile-spotlight-card">
      
      <!-- Top Banner -->
      <div class="m-card-banner">
        <div class="m-banner-right">
          <div class="m-banner-avatar" style="background:${currentBooth.color}20;border-color:${currentBooth.color}60;color:${currentBooth.color}">
            ${currentBooth.icon}
          </div>
          <div class="m-banner-titles">
            <h2>${currentBooth.name}</h2>
            <span class="m-banner-subtitle">استشارة 15 دقيقة • جدول مستقل</span>
          </div>
        </div>
        <div class="m-banner-avail" style="background:${currentBooth.color}15;color:${currentBooth.color};border-color:${currentBooth.color}50">
          ${currentAvail} موعد متاح
        </div>
      </div>

      <!-- Quick Date Strip -->
      <div class="m-date-strip">
        <span>📅 السبت 12 ديسمبر 2026</span>
        <span class="m-ds-dot">•</span>
        <span>توقيت عمّان</span>
      </div>

      <!-- Sessions Container -->
      <div class="m-sessions-container">
        
        <!-- Morning Session -->
        <div class="m-session-block">
          <div class="m-session-title">
            <span class="m-st-icon">🌅</span>
            <span>الفترة الصباحية</span>
            <span class="m-st-badge">10:30 ص – 1:25 م</span>
          </div>
          ${renderMobileSlotCards(morningSlots)}
        </div>

        <!-- Universal Exhibition Break -->
        <div class="m-break-card">
          <span class="m-bc-icon">☕</span>
          <div class="m-bc-content">
            <strong>استراحة المعرض الموحدة (1:25 – 1:40 ظهراً)</strong>
            <span>فترة راحة موحدة لجميع البوثات والمستشارين</span>
          </div>
        </div>

        <!-- Evening Session -->
        <div class="m-session-block">
          <div class="m-session-title">
            <span class="m-st-icon">🌇</span>
            <span>الفترة المسائية</span>
            <span class="m-st-badge">1:40 م – 5:15 م</span>
          </div>
          ${renderMobileSlotCards(eveningSlots)}
        </div>

      </div>

      <!-- Consultant Quick Switcher Bottom -->
      <div class="m-consultant-switcher">
        <button type="button" class="m-nav-btn" onclick="switchMobileConsultant('${prevBooth.id}')">
          <span>⬅️</span>
          <span>السابق: ${prevBooth.name}</span>
        </button>
        <button type="button" class="m-nav-btn" onclick="switchMobileConsultant('${nextBooth.id}')">
          <span>التالي: ${nextBooth.name}</span>
          <span>➡️</span>
        </button>
      </div>

    </div>
  `;
}

function switchMobileConsultant(boothId) {
  activeMobileBoothId = boothId;
  renderMobileBooths();
}

// Master Render: updates both desktop and mobile
function renderAllBooths() {
  renderDesktopBooths();
  renderMobileBooths();
}

function buildTabs() {
  const t = document.getElementById("boothQuickTabs");
  if (!t) return;
  t.innerHTML = "";
  BOOTHS.forEach(b => {
    const p = document.createElement("button");
    p.className = "tab-pill";
    p.textContent = b.name;
    p.onclick = () => document.getElementById(`card-${b.id}`)?.scrollIntoView({behavior:'smooth',block:'start'});
    t.appendChild(p);
  });
}

// Booking flow
function openBooking(boothId, slotId) {
  const booth = BOOTHS.find(b => b.id === boothId);
  const slot = TIME_SLOTS.find(s => s.id === slotId);
  if (!booth || !slot) return;
  window._pending = { booth, slot };
  document.getElementById("summaryBoothName").textContent = booth.name;
  document.getElementById("summarySlotTime").textContent = `من ${slot.start} إلى ${slot.end} (${slot.period})`;
  document.getElementById("modalBoothTitle").textContent = booth.name;
  document.getElementById("inputVisitorName").value = "";
  document.getElementById("inputVisitorPhone").value = "";
  document.getElementById("bookingModal").classList.remove("hidden");
  document.getElementById("inputVisitorName").focus();
}

function closeBookingModal() {
  document.getElementById("bookingModal").classList.add("hidden");
  window._pending = null;
}

function submitBooking(e) {
  e.preventDefault();
  if (!window._pending) return;
  const { booth, slot } = window._pending;
  const name = document.getElementById("inputVisitorName").value.trim();
  const rawPhone = document.getElementById("inputVisitorPhone").value.trim();
  const cleanPhone = rawPhone.replace(/\D/g, "");

  if (!name || name.length < 2) { alert("يرجى إدخال الاسم بشكل صحيح."); return; }
  if (!cleanPhone || cleanPhone.length < 8) { alert("يرجى إدخال رقم هاتف صحيح."); return; }

  // Check 1: Slot taken in this booth
  if (bookings.some(b => b.boothId === booth.id && b.slotId === slot.id)) {
    alert(`عذراً! تم حجز موعد (من ${slot.start} إلى ${slot.end}) لدى ${booth.name} للتو.`);
    closeBookingModal(); renderAllBooths(); return;
  }

  // Check 2: Same visitor cannot book in another booth at the exact same slot
  const clash = bookings.find(b => b.phone.replace(/\D/g,"") === cleanPhone && b.slotId === slot.id);
  if (clash) {
    const cb = BOOTHS.find(b => b.id === clash.boothId) || {name:"بوث آخر"};
    alert(`⚠️ تعارض!\n\nلديك حجز بالفعل في نفس التوقيت (من ${slot.start} إلى ${slot.end}) لدى: ${cb.name}.\n\nيرجى اختيار وقت مختلف لزيارة ${booth.name}.`);
    return;
  }

  // Exact registration timestamp (Amman Timezone with seconds)
  const now = new Date();
  const ammanFormatted = now.toLocaleString("ar-JO", {
    timeZone: "Asia/Amman",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: true
  });
  
  // SQL Standard YYYY-MM-DD HH:MM:SS
  const pad = n => String(n).padStart(2, '0');
  const sqlDate = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const slotRangeStr = `من ${slot.start} إلى ${slot.end}`;

  const bk = {
    id: "BK" + Date.now() + Math.floor(Math.random()*999),
    service: "موعد زيارة بوث",
    boothId: booth.id,
    boothName: booth.name,
    slotId: slot.id,
    startTime: slot.start,
    endTime: slot.end,
    period: slot.period,
    slotRange: slotRangeStr,
    slotTime: `${slot.start}–${slot.end}`,
    visitorName: name,
    phone: rawPhone,
    date: EXHIBITION_DATE,
    registeredAt: ammanFormatted,
    registeredAtSql: sqlDate,
    timestamp: Date.now()
  };

  DB.add(bk);
  closeBookingModal();
  renderAllBooths();
  showSuccess(bk);
}

function showSuccess(bk) {
  document.getElementById("successDesc").textContent = `تم تأكيد موعدك بنجاح مع ${bk.boothName}.`;
  document.getElementById("successTicket").innerHTML = `
    <div class="bs-row"><span>الاسم:</span><strong>${bk.visitorName}</strong></div>
    <div class="bs-row"><span>الهاتف:</span><strong dir="ltr">${bk.phone}</strong></div>
    <div class="bs-row"><span>المستشار:</span><strong class="text-brand">${bk.boothName}</strong></div>
    <div class="bs-row"><span>الموعد:</span><strong class="text-orange">${bk.slotRange} (${bk.period || ''})</strong></div>
    <div class="bs-row"><span>تاريخ المعرض:</span><strong>${bk.date} (توقيت عمّان)</strong></div>
    <div class="bs-row"><span>وقت تسجيل الحجز:</span><strong style="font-size:0.85rem;color:#7f8c8d;">${bk.registeredAt}</strong></div>`;
  document.getElementById("successModal").classList.remove("hidden");
}

function closeSuccessModal() { document.getElementById("successModal").classList.add("hidden"); }

// Services
function selectService(which) {
  const cp = document.getElementById("chipThePlatform");
  const cb = document.getElementById("chipBooth");
  const dSec = document.getElementById("desktopBoothsSection");
  const mSec = document.getElementById("mobileBoothsSection");
  const pv = document.getElementById("thePlatformView");
  const sn = document.querySelector(".sticky-nav");
  if (which === "the-platform") {
    cp.classList.add("active"); cb.classList.remove("active");
    if (dSec) dSec.classList.add("hidden");
    if (mSec) mSec.classList.add("hidden");
    pv.classList.remove("hidden");
    if (sn) sn.classList.add("hidden");
  } else {
    cp.classList.remove("active"); cb.classList.add("active");
    if (dSec) dSec.classList.remove("hidden");
    if (mSec) mSec.classList.remove("hidden");
    pv.classList.add("hidden");
    if (sn) sn.classList.remove("hidden");
  }
}

// Admin
function openAdminModal() {
  document.getElementById("adminLoginModal").classList.remove("hidden");
  document.getElementById("adminPasswordInput").value = "";
  document.getElementById("adminPasswordInput").focus();
}
function closeAdminLoginModal() { document.getElementById("adminLoginModal").classList.add("hidden"); }

function handleAdminAuth(e) {
  e.preventDefault();
  if (document.getElementById("adminPasswordInput").value === ADMIN_PASSWORD) {
    closeAdminLoginModal();
    document.getElementById("publicView").classList.add("hidden");
    document.getElementById("adminView").classList.remove("hidden");
    populateFilter(); renderAdminTable();
  } else { alert("كلمة المرور غير صحيحة."); }
}

function closeAdminView() {
  document.getElementById("adminView").classList.add("hidden");
  document.getElementById("publicView").classList.remove("hidden");
  renderAllBooths();
}

function populateFilter() {
  const s = document.getElementById("adminBoothFilter");
  s.innerHTML = '<option value="all">جميع البوثات</option>';
  BOOTHS.forEach(b => s.innerHTML += `<option value="${b.id}">${b.name}</option>`);
}

function renderAdminTable() {
  const tbody = document.getElementById("adminTableBody");
  const f = document.getElementById("adminBoothFilter").value;
  const q = document.getElementById("adminSearchInput").value.trim().toLowerCase();
  let list = [...bookings];
  if (f !== "all") list = list.filter(b => b.boothId === f);
  if (q) list = list.filter(b => (b.visitorName||"").toLowerCase().includes(q) || (b.phone||"").includes(q) || (b.boothName||"").toLowerCase().includes(q));

  list.sort((a,b) => {
    const ba = BOOTHS.findIndex(x=>x.id===a.boothId), bb = BOOTHS.findIndex(x=>x.id===b.boothId);
    if (ba !== bb) return ba - bb;
    return TIME_SLOTS.findIndex(x=>x.id===a.slotId) - TIME_SLOTS.findIndex(x=>x.id===b.slotId);
  });

  document.getElementById("adminBookingsCount").textContent = `${list.length} حجز`;
  tbody.innerHTML = "";
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#7f8c8d;">لا توجد حجوزات مسجلة حتى الآن</td></tr>'; return; }
  
  list.forEach((b,i) => {
    const sFrom = b.startTime || (b.slotTime ? b.slotTime.split('–')[0].trim() : '');
    const sTo = b.endTime || (b.slotTime ? b.slotTime.split('–')[1].trim() : '');
    const sRange = b.slotRange || `من ${sFrom} إلى ${sTo}`;
    const regTime = b.registeredAt || b.createdAt || '-';

    tbody.innerHTML += `<tr>
      <td>${i+1}</td>
      <td><strong>${b.boothName}</strong></td>
      <td>
        <div class="time-range-cell">
          <span class="range-badge">${sRange}</span>
          ${b.period ? `<span class="period-sub">(${b.period})</span>` : ''}
        </div>
      </td>
      <td><strong>${b.visitorName}</strong></td>
      <td dir="ltr" class="phone-cell">${b.phone}</td>
      <td>
        <div class="reg-time-cell">
          <span class="reg-time-badge">${regTime}</span>
        </div>
      </td>
      <td><button class="tp-btn tp-btn-danger btn-sm" onclick="adminDel('${b.id}')">إلغاء</button></td>
    </tr>`;
  });
}

function adminDel(id) {
  const b = bookings.find(x=>x.id===id);
  if (b && confirm(`إلغاء حجز ${b.visitorName} (${b.boothName} - ${b.slotRange || b.slotTime})؟`)) { 
    DB.remove(id); 
    renderAdminTable(); 
  }
}

function confirmResetAll() {
  if (confirm("هل أنت متأكد من تفريغ جميع الحجوزات بالكامل؟ لا يمكن التراجع عن هذه الخطوة.")) { 
    DB.reset(); 
    renderAdminTable(); 
  }
}

// Export as Real SQL Dump
function exportDataToSQL() {
  if (!bookings.length) { alert("لا توجد حجوزات لتصديرها."); return; }
  let sql = "-- ============================================================\n";
  sql += `-- The Platform - تفريغ بيانات الحجوزات (SQL Database Dump)\n`;
  sql += `-- تاريخ وتوقيت التصدير: ${new Date().toLocaleString("ar-JO", {timeZone:"Asia/Amman"})}\n`;
  sql += "-- ============================================================\n\n";
  sql += "USE `exhibition_db`;\n\n";
  sql += "INSERT INTO `consultation_bookings` \n";
  sql += "(`id`, `service_name`, `booth_id`, `booth_name`, `slot_id`, `start_time`, `end_time`, `slot_range`, `appointment_date`, `visitor_name`, `visitor_phone`, `registered_at`, `registered_at_formatted`, `status`, `created_timestamp`) VALUES\n";

  const rows = bookings.map(b => {
    const esc = s => (s || '').replace(/'/g, "''");
    const sFrom = esc(b.startTime || (b.slotTime ? b.slotTime.split('–')[0].trim() : ''));
    const sTo = esc(b.endTime || (b.slotTime ? b.slotTime.split('–')[1].trim() : ''));
    const sRange = esc(b.slotRange || `من ${sFrom} إلى ${sTo}`);
    const regSql = esc(b.registeredAtSql || new Date().toISOString().slice(0, 19).replace('T', ' '));
    const regFmt = esc(b.registeredAt || b.createdAt || '');
    const ts = b.timestamp || Date.now();
    return `('${esc(b.id)}', 'موعد زيارة بوث', '${esc(b.boothId)}', '${esc(b.boothName)}', '${esc(b.slotId)}', '${sFrom}', '${sTo}', '${sRange}', '2026-12-12', '${esc(b.visitorName)}', '${esc(b.phone)}', '${regSql}', '${regFmt}', 'confirmed', ${ts})`;
  });

  sql += rows.join(",\n") + ";\n";

  const blob = new Blob([sql], { type: "application/sql;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `consultations_sql_backup_${Date.now()}.sql`;
  a.click();
}

// Export as CSV
function exportDataToCSV() {
  if (!bookings.length) { alert("لا توجد حجوزات."); return; }
  let csv = "\uFEFF" + "رقم الحجز,البوث,الموعد (من - إلى),اسم الزائر,رقم الهاتف,تاريخ المعرض,توقيت التسجيل الفعلي\n";
  bookings.forEach(b => {
    const sRange = b.slotRange || b.slotTime;
    const regTime = b.registeredAt || b.createdAt || '';
    csv += `"${b.id}","${b.boothName}","${sRange}","${b.visitorName}","${b.phone}","${b.date}","${regTime}"\n`;
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8;"}));
  a.download = `حجوزات_استشارات_2026_${Date.now()}.csv`;
  a.click();
}

// Triple-click / Triple-tap on "بوابة" to access admin
(function setupGateTrigger() {
  let clicks = 0, timer = null;
  window.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("gateTrigger");
    if (!el) return;
    const handleTrigger = (e) => {
      clicks++;
      if (timer) clearTimeout(timer);
      if (clicks >= 3) {
        clicks = 0;
        openAdminModal();
      } else {
        timer = setTimeout(() => clicks = 0, 600);
      }
    };
    el.addEventListener("click", handleTrigger);
    el.addEventListener("touchend", handleTrigger);
  });
})();

// Init
window.addEventListener("DOMContentLoaded", () => {
  DB.load();
  renderAllBooths();
});
