import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 191, unique: true, nullable: false })
    email: string;

    @Column()
    hashedPassword: string;

    @Column({ length: 191 })
    firstName: string;

    @Column({ length: 191 })
    lastName: string;
}
