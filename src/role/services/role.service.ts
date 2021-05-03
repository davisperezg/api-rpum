import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleInput } from '../dto/inputs/role.input';
import { RoleDocument } from '../schemas/role.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RoleUpdateInput } from '../dto/inputs/role-update.input';
import { ModuleService } from 'src/modules/services/module.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel('Role')
    private readonly roleModel: Model<RoleDocument>,
    private readonly moduleService: ModuleService,
  ) {}

  //Post a single role
  async createRole(roleInput: RoleInput): Promise<RoleDocument> {
    const { name, modules } = roleInput;
    //find role by name and validate if it exists
    await this.findOneRoleByName(name, 'exist');

    const getIdModules = await this.moduleService.findIdsByNameModules(modules);

    const newRole = new this.roleModel({
      ...roleInput,
      modules: getIdModules,
    });

    let saveRole: RoleDocument;
    let foundRole: RoleDocument;

    try {
      saveRole = await newRole.save();
    } catch (e) {
      throw new Error(`Error en RoleService.createRole ${e}`);
    }

    try {
      foundRole = await saveRole
        .populate([
          {
            path: 'modules',
            populate: {
              path: 'menus',
            },
          },
        ])
        .execPopulate();
    } catch (e) {
      throw new Error(`Error en RoleService.createRole.populate ${e}`);
    }

    return foundRole;
  }

  //Put one role
  async updateRole(roleInput: RoleUpdateInput): Promise<RoleDocument> {
    const { id, modules } = roleInput;

    //find role by id and valid if does not exist
    await this.findOneRoleById(id);

    //get Ids modules by names
    const getIdsModules = await this.moduleService.findIdsByNameModules(
      modules,
    );

    let updateRole: RoleDocument;

    try {
      updateRole = await this.roleModel
        .findByIdAndUpdate(
          id,
          { ...roleInput, modules: getIdsModules },
          {
            new: true,
          },
        )
        .populate([
          {
            path: 'modules',
            populate: {
              path: 'menus',
            },
          },
        ]);
    } catch (e) {
      throw new Error(`Error en RoleService.updateRole ${e}`);
    }

    return updateRole;
  }

  //Delete one role by id
  async deleteRoleById(id: string): Promise<boolean> {
    await this.findOneRoleById(id);

    try {
      //if exists role, delete role
      await this.roleModel.findByIdAndDelete(id);
      return true;
    } catch (e) {
      throw new Error(`Error en RoleService.deleteRoleById ${e}`);
    }
  }

  //Get all roles
  async findAllRoles(): Promise<RoleDocument[]> {
    let findRoles: RoleDocument[];

    try {
      findRoles = await this.roleModel.find().populate([
        {
          path: 'modules',
          populate: {
            path: 'menus',
          },
        },
      ]);
    } catch (e) {
      throw new Error(`Error en RoleService.findAllRoles ${e}`);
    }

    return findRoles;
  }

  //Get one role by id
  async findOneRoleById(id: string): Promise<RoleDocument> {
    let role: RoleDocument;

    try {
      role = await this.roleModel.findById(id).populate([
        {
          path: 'modules',
          populate: {
            path: 'menus',
          },
        },
      ]);
    } catch (e) {
      throw new Error(`Error en RoleService.findOneRoleById ${e}`);
    }

    //if does not exist
    if (!role)
      throw new NotFoundException(`El rol no se encuentra o no existe`);

    return role;
  }

  //Get one role by param
  async findOneRoleByName(name: string, param: string): Promise<RoleDocument> {
    let role: RoleDocument;

    try {
      role = await this.roleModel.findOne({ name });
    } catch (e) {
      throw new Error(`Error en RoleService.findOneRoleByName ${e}`);
    }

    switch (param) {
      case 'exist':
        if (role) throw new BadRequestException(`El rol ${name} ya existe`);
        break;

      case 'noexist':
        if (!role)
          throw new NotFoundException(`El rol no se encuentra o no existe`);
        return role;
    }
  }
}
