import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { TicketService } from '../service/ticket.service';
import { ITicket, Ticket } from '../ticket.model';
import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { ILabel } from 'app/entities/label/label.model';
import { LabelService } from 'app/entities/label/service/label.service';

import { TicketUpdateComponent } from './ticket-update.component';

describe('Ticket Management Update Component', () => {
  let comp: TicketUpdateComponent;
  let fixture: ComponentFixture<TicketUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let ticketService: TicketService;
  let projectService: ProjectService;
  let userService: UserService;
  let labelService: LabelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [TicketUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(TicketUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TicketUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    ticketService = TestBed.inject(TicketService);
    projectService = TestBed.inject(ProjectService);
    userService = TestBed.inject(UserService);
    labelService = TestBed.inject(LabelService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Project query and add missing value', () => {
      const ticket: ITicket = { id: 456 };
      const project: IProject = { id: 3342 };
      ticket.project = project;

      const projectCollection: IProject[] = [{ id: 32088 }];
      jest.spyOn(projectService, 'query').mockReturnValue(of(new HttpResponse({ body: projectCollection })));
      const additionalProjects = [project];
      const expectedCollection: IProject[] = [...additionalProjects, ...projectCollection];
      jest.spyOn(projectService, 'addProjectToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      expect(projectService.query).toHaveBeenCalled();
      expect(projectService.addProjectToCollectionIfMissing).toHaveBeenCalledWith(projectCollection, ...additionalProjects);
      expect(comp.projectsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call User query and add missing value', () => {
      const ticket: ITicket = { id: 456 };
      const assignedTo: IUser = { id: 'f3f9ef65-7ff8-42d5-815c-f44fc370d6a1' };
      ticket.assignedTo = assignedTo;
      const reportedBy: IUser = { id: '7f9da28a-a967-4bea-95d5-a2ec14738315' };
      ticket.reportedBy = reportedBy;

      const userCollection: IUser[] = [{ id: 'f6da390a-2d54-4545-9bf0-efa5a45853a0' }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [assignedTo, reportedBy];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(userCollection, ...additionalUsers);
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Label query and add missing value', () => {
      const ticket: ITicket = { id: 456 };
      const labels: ILabel[] = [{ id: 30517 }];
      ticket.labels = labels;

      const labelCollection: ILabel[] = [{ id: 33690 }];
      jest.spyOn(labelService, 'query').mockReturnValue(of(new HttpResponse({ body: labelCollection })));
      const additionalLabels = [...labels];
      const expectedCollection: ILabel[] = [...additionalLabels, ...labelCollection];
      jest.spyOn(labelService, 'addLabelToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      expect(labelService.query).toHaveBeenCalled();
      expect(labelService.addLabelToCollectionIfMissing).toHaveBeenCalledWith(labelCollection, ...additionalLabels);
      expect(comp.labelsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const ticket: ITicket = { id: 456 };
      const project: IProject = { id: 1082 };
      ticket.project = project;
      const assignedTo: IUser = { id: '8c89b2ac-08e0-4d20-be23-2ca9e1550aab' };
      ticket.assignedTo = assignedTo;
      const reportedBy: IUser = { id: '268f6e9f-638a-48db-a7cf-2669fb03b89b' };
      ticket.reportedBy = reportedBy;
      const labels: ILabel = { id: 88448 };
      ticket.labels = [labels];

      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(ticket));
      expect(comp.projectsSharedCollection).toContain(project);
      expect(comp.usersSharedCollection).toContain(assignedTo);
      expect(comp.usersSharedCollection).toContain(reportedBy);
      expect(comp.labelsSharedCollection).toContain(labels);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Ticket>>();
      const ticket = { id: 123 };
      jest.spyOn(ticketService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: ticket }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(ticketService.update).toHaveBeenCalledWith(ticket);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Ticket>>();
      const ticket = new Ticket();
      jest.spyOn(ticketService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: ticket }));
      saveSubject.complete();

      // THEN
      expect(ticketService.create).toHaveBeenCalledWith(ticket);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Ticket>>();
      const ticket = { id: 123 };
      jest.spyOn(ticketService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ticket });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(ticketService.update).toHaveBeenCalledWith(ticket);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackProjectById', () => {
      it('Should return tracked Project primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackProjectById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });

    describe('trackUserById', () => {
      it('Should return tracked User primary key', () => {
        const entity = { id: 'ABC' };
        const trackResult = comp.trackUserById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });

    describe('trackLabelById', () => {
      it('Should return tracked Label primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackLabelById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });

  describe('Getting selected relationships', () => {
    describe('getSelectedLabel', () => {
      it('Should return option if no Label is selected', () => {
        const option = { id: 123 };
        const result = comp.getSelectedLabel(option);
        expect(result === option).toEqual(true);
      });

      it('Should return selected Label for according option', () => {
        const option = { id: 123 };
        const selected = { id: 123 };
        const selected2 = { id: 456 };
        const result = comp.getSelectedLabel(option, [selected2, selected]);
        expect(result === selected).toEqual(true);
        expect(result === selected2).toEqual(false);
        expect(result === option).toEqual(false);
      });

      it('Should return option if this Label is not selected', () => {
        const option = { id: 123 };
        const selected = { id: 456 };
        const result = comp.getSelectedLabel(option, [selected]);
        expect(result === option).toEqual(true);
        expect(result === selected).toEqual(false);
      });
    });
  });
});
