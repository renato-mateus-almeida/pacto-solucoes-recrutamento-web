import { Component, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { VacancyService } from '../../../core/services/vacancy';
import { VacancyResponse, VacancyStatus } from '../../../core/models/vacancy.model';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-vacancy-form',
  imports: [ReactiveFormsModule, RouterLink, NgIcon, ConfirmModal],
  templateUrl: './admin-vacancy-form.html',
  styleUrl: './admin-vacancy-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminVacancyForm {
  private static readonly STATUS = {
    DRAFT: 'DRAFT' as const,
    OPEN: 'OPEN' as const,
  };

  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly vacancyService = inject(VacancyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: [AdminVacancyForm.STATUS.OPEN as VacancyStatus, Validators.required]
  });

  protected readonly requirements = signal<string[]>([]);
  protected readonly newRequirement = signal('');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly isEditing = signal(false);
  protected readonly originalStatus = signal<VacancyStatus | null>(null);
  protected readonly showPublishModal = signal(false);
  protected readonly loading = signal(false);

  private editingId: number | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.editingId = Number(id);
    }
  }

  ngOnInit(): void {
    if (!this.editingId) return;
    this.loading.set(true);
    this.vacancyService.getById(this.editingId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (v) => this.patchFormWithVacancy(v),
      error: () => this.handleLoadError()
    });
  }

  protected addRequirement(): void {
    const val = this.newRequirement().trim();
    if (val) {
      this.requirements.update(arr => [...arr, val]);
      this.newRequirement.set('');
    }
  }

  protected removeRequirement(index: number): void {
    this.requirements.update(arr => arr.filter((_, i) => i !== index));
  }

  protected setStatus(status: VacancyStatus): void {
    this.form.controls.status.setValue(status);
  }

  protected readonly isPublishedAsOpen = () =>
    this.isEditing() && this.originalStatus() === AdminVacancyForm.STATUS.OPEN;

  protected confirmPublish(): void {
    if (!this.validateForm()) return;
    this.showPublishModal.set(true);
  }

  protected publish(): void {
    this.form.controls.status.setValue(AdminVacancyForm.STATUS.OPEN);
    this.showPublishModal.set(false);
    this.doSubmit();
  }

  protected saveAsDraft(): void {
    if (!this.validateForm()) return;
    this.form.controls.status.setValue(AdminVacancyForm.STATUS.DRAFT);
    this.doSubmit();
  }

  protected saveEdits(): void {
    if (!this.validateForm()) return;
    this.doSubmit();
  }

  private doSubmit(): void {
    this.beginSubmit();
    const data = this.buildVacancyData();
    const request$ = this.buildRequest(data);
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.router.navigate(['/admin/vacancies']),
      error: (err: HttpErrorResponse) => this.handleSubmitError(err)
    });
  }

  private patchFormWithVacancy(v: VacancyResponse): void {
    this.form.patchValue({ title: v.title, description: v.description ?? '', status: v.status });
    this.requirements.set(v.requirements.map(r => r.description));
    this.originalStatus.set(v.status);
    this.loading.set(false);
  }

  private handleLoadError(): void {
    this.error.set('Erro ao carregar vaga');
    this.loading.set(false);
  }

  private validateForm(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }
    return true;
  }

  private beginSubmit(): void {
    this.submitting.set(true);
    this.error.set(null);
  }

  private buildVacancyData() {
    return { ...this.form.getRawValue(), requirements: this.requirements() };
  }

  private buildRequest(data: ReturnType<AdminVacancyForm['buildVacancyData']>) {
    return this.isEditing()
      ? this.vacancyService.update(this.editingId!, data)
      : this.vacancyService.create(data);
  }

  private handleSubmitError(err: HttpErrorResponse): void {
    this.submitting.set(false);
    this.error.set(err.status === 400 ? 'Verifique os campos' : 'Erro ao salvar vaga');
  }
}
